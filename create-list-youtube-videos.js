const myYoutubeVideos = require("./youtube-videos-object.json");

const parseVideos = myYoutubeVideos.map((video) => ({
  name: video.title,
  url: `https://www.youtube.com/watch?v=${video.videoId}`,
  thumbnail: `https://i.ytimg.com/vi/${video.videoId}/maxresdefault.jpg`,
  type: "video",
}));

let groups = [];
const splitNumber = 6;
for (let i = 0; i < parseVideos.length; i += splitNumber) {
  let group = {
    title: "#" + (i / splitNumber + 1),
    items: [...parseVideos.slice(i, i + splitNumber), { type: "message" }],
  };
  groups.push(group);
}

console.log(JSON.stringify(groups));
