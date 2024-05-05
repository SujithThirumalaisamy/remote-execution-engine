import { createClient } from "redis";
const redisClient = createClient();
redisClient.connect();

async function main() {
  while (true) {
    try {
      const submission_id = await redisClient.RPOP("submission_ids");
      if(submission_id === null){
        throw Error("No Submissions in Queue currently")
    }
      console.log(submission_id);
    } catch (error) {
      setTimeout(() => {
        console.log(error);
      }, 1000);
    }
  }
}

main();
