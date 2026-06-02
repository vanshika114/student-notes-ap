const patterns = require('../data/patterns.json');
const { fetchLeetCodeProblem } = require('../utils/leetcode');

exports.getPatterns = (req, res) => {
  res.json(patterns);
};

exports.getPatternDetails = async (req, res) => {
  const { id } = req.params;
  const pattern = patterns.find(p => p.id === id);
  
  if (!pattern) {
    return res.status(404).json({ error: 'Pattern not found' });
  }

  try {
    // Fetch actual problem stats from LeetCode
    const problemsWithStats = await Promise.all(
      pattern.problems.map(async (slug) => {
        const stats = await fetchLeetCodeProblem(slug);
        if (stats) {
          return {
            ...stats,
            titleSlug: slug
          };
        } else {
          return {
            titleSlug: slug,
            title: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            difficulty: 'Unknown',
            acRate: 0
          };
        }
      })
    );

    const fullPattern = {
      ...pattern,
      problems: problemsWithStats
    };

    res.json(fullPattern);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pattern details' });
  }
};
