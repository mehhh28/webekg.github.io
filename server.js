const { Server } = require("ws");

const sockserver = new Server({ port: 3211 });

let playing = true;

sockserver.on("connection", (ws) => {
  console.log("New client connected!");
  ws.on("close", () => console.log("Client has disconnected!"));
  ws.on("message", (data) => {
    console.log("received: %s", data);
    switch (data.toString()) {
      case "p":
        playing = !playing;
        console.log({ playing });

        break;

      default:
        break;
    }
  });
});

const getRandomInRange = (min, max) => {
  return Math.round(min + Math.random() * (max - min));
};

const simulateECG = (msecDiv) => {
  let min = 0;
  let max = 4000;

  if (msecDiv < 450 || msecDiv > 550) {
    min = 1000;
    max = 1100;
  }
  if ((msecDiv < 250 && msecDiv > 100) || (msecDiv < 900 && msecDiv > 800)) {
    min = 1100;
    max = 1200;
  }
  if ((msecDiv < 450 && msecDiv > 380) || (msecDiv < 650 && msecDiv > 550)) {
    min = 900;
    max = 1000;
  }
  if (msecDiv >= 450 && msecDiv <= 550) {
    min = 1100;
    max = 2000;
  }
  if (msecDiv >= 490 && msecDiv <= 510) {
    min = 2000;
    max = 3000;
  }
  return getRandomInRange(min, max);
};

const simulateECTBatch = (msecDiv, batchLength) => {
  let data = "";
  for (let i = 0; i < batchLength; i++) {
    data += `${500 + Math.round(Math.random() * msecDiv * 2)} `;
  }
  return data;
};

const batchLength = 1;
setInterval(() => {
  if (playing) {
    const msecDiv = +new Date() % 1000;

    sockserver.clients.forEach((client) => {
      const data =
        batchLength > 1
          ? simulateECTBatch(msecDiv, batchLength)
          : simulateECG(msecDiv);

      client.send(data);
    });
  }
}, batchLength * 10 - 1);
