module.exports = {
  apps: [
    {
      name: "todo-app",
      script: "index.js",
      instances: "3",
      exec_mode: "cluster",
      error_file: "logs/error.log",
      out_file: "logs/output.log",
      merge_logs: true,
      watch: true,
      env: {
        NODE_ENV: "production",
      },
      env_production: {
        NODE_ENV: "production",
        PORT: process.env.PORT,
      },
    },
  ],
};
