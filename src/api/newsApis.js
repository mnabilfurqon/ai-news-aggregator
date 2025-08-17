export async function fetchAllNews() {
  const gnewsUrl = `https://gnews.io/api/v4/search?q=artificial%20intelligence&token=${import.meta.env.VITE_GNEWS_API_KEY}&lang=en`;
  const newsDataUrl = `https://newsdata.io/api/1/news?apikey=${import.meta.env.VITE_NEWSDATA_API_KEY}&q=artificial%20intelligence&language=en`;
  const mediastackUrl = `http://api.mediastack.com/v1/news?access_key=${import.meta.env.VITE_MEDIASTACK_API_KEY}&keywords=artificial intelligence&languages=en`;

  try {
    const [gnewsRes, newsdataRes, mediastackRes] = await Promise.all([
      fetch(gnewsUrl),
      fetch(newsDataUrl),
      fetch(mediastackUrl)
    ]);

    const [gnews, newsdata, mediastack] = await Promise.all([
      gnewsRes.json(),
      newsdataRes.json(),
      mediastackRes.json()
    ]);

    const normalized = [
      ...(gnews.articles || []).map(article => ({
        title: article.title,
        url: article.url,
        publishedAt: article.publishedAt,
        source: 'GNews'
      })),
      ...(newsdata.results || []).map(article => ({
        title: article.title,
        url: article.link,
        publishedAt: article.pubDate,
        source: 'NewsData'
      })),
      ...(mediastack.data || []).map(article => ({
        title: article.title,
        url: article.url,
        publishedAt: article.published_at,
        source: 'Mediastack'
      }))
    ];

    return normalized;
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}
