const followBtn = document.getElementById("follow");
const followersEl = document.getElementById("followers");

let isFollowing = false;
let followerCount = 1800;

const formatCount = (count) => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
};

const updateFollowers = () => {
  followersEl.textContent = formatCount(followerCount);
  followBtn.textContent = isFollowing ? "Following" : "Follow";
  followBtn.setAttribute("aria-pressed", isFollowing.toString());
};

followBtn.addEventListener("click", () => {
  isFollowing = !isFollowing;
  followerCount += isFollowing ? 1 : -1;
  updateFollowers();
});

updateFollowers();
