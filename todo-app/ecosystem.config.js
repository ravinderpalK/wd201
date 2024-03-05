module.exports = {
  apps: [
    {
      name: "app",
      script: "./index.js",
      instances: "max",
      exec_mode: "cluster",
    },
  ],
};
