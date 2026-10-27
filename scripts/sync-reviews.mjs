// Copies ARKA's Google Business Profile reviews into the Wix "Reviews" CMS collection.
// Runs daily in GitHub Actions. Needs WIX_API_KEY (a repository secret) in the environment.
// Existing reviews keep their `show` setting, so a review can be hidden in the Wix dashboard.

const SITE_ID = "538a1f6a-682c-4bda-8ff2-985e0b90f8e1";
const LOCATION_ID = "4479854276661313591";
const COLLECTION = "Reviews";
const KEY = process.env.WIX_API_KEY;

if (!KEY) throw new Error("WIX_API_KEY is not set");

async function wix(method, path, body) {
  const res = await fetch("https://www.wixapis.com" + path, {
    method,
    headers: { Authorization: KEY, "wix-site-id": SITE_ID, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} failed with ${res.status}: ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : {};
}

async function fetchGoogleReviews() {
  const page = await wix("GET", `/gbp/v1/locations/${LOCATION_ID}/reviews?orderBy=NEWEST&paging.limit=50`);
  if (page.pagingMetadata && page.pagingMetadata.hasNext) {
    console.warn("More than 100 reviews; only the newest 100 were synced.");
  }
  return page.reviews || [];
}

async function fetchExistingItems() {
  const items = [];
  for (let offset = 0; ; offset += 100) {
    const q = await wix("POST", "/data/v2/items/query", {
      dataCollectionId: COLLECTION,
      query: { paging: { limit: 100, offset } },
    });
    const page = q.dataItems || [];
    items.push(...page);
    if (page.length < 100) break;
  }
  return items;
}

function toData(review) {
  return {
    reviewId: review.reviewId,
    reviewerName: review.reviewerDisplayName || "",
    starRating: typeof review.starRating === "number" ? review.starRating : 5,
    comment: review.comment || "",
    createTime: review.createTime || "",
    replyText: (review.reply && review.reply.text) || "",
    replyTime: (review.reply && review.reply.updateTime) || "",
  };
}

async function main() {
  const reviews = await fetchGoogleReviews();
  const existing = await fetchExistingItems();
  const byReviewId = new Map(existing.map((item) => [item.data && item.data.reviewId, item]));

  const toInsert = [];
  let updated = 0;
  for (const review of reviews) {
    const data = toData(review);
    const current = byReviewId.get(data.reviewId);
    if (!current) {
      toInsert.push({ dataCollectionId: COLLECTION, data: { ...data, show: true } });
      continue;
    }
    const changed = Object.keys(data).some((k) => (current.data || {})[k] !== data[k]);
    if (changed) {
      await wix("PUT", `/data/v2/items/${current.id}`, {
        dataCollectionId: COLLECTION,
        dataItem: { id: current.id, dataCollectionId: COLLECTION, data: { ...current.data, ...data } },
      });
      updated++;
    }
  }

  for (let i = 0; i < toInsert.length; i += 100) {
    await wix("POST", "/data/v2/bulk/items/insert", {
      dataCollectionId: COLLECTION,
      dataItems: toInsert.slice(i, i + 100),
    });
  }

  console.log(`Google reviews: ${reviews.length}. New: ${toInsert.length}. Updated: ${updated}.`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
