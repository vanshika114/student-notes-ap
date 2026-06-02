const axios = require('axios');

async function fetchLeetCodeProblem(titleSlug) {
  const query = `
    query questionData($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        questionId
        title
        titleSlug
        difficulty
        acRate
        topicTags {
          name
        }
      }
    }
  `;

  try {
    const response = await axios.post('https://leetcode.com/graphql', {
      query,
      variables: { titleSlug }
    });
    return response.data.data.question;
  } catch (error) {
    console.error('Error fetching from LeetCode:', error.message);
    return null;
  }
}

module.exports = {
  fetchLeetCodeProblem
};
