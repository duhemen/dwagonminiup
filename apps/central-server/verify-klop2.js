const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

(async () => {
  const talkshow = await p.talkshowEpisode.count();
  const forumTopic = await p.forumTopic.count();
  const forumReply = await p.forumReply.count();

  console.log('TalkshowEpisode :', talkshow);
  console.log('ForumTopic      :', forumTopic);
  console.log('ForumReply      :', forumReply);

  await p.$disconnect();
  process.exit(0);
})();