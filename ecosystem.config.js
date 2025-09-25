module.exports = {
  apps: [
    {
      name: "esempe-md",
      script: "./index.js",
      watch: false,
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production"
      },
      env_development: {
        NODE_ENV: "development"
      }
    }
  ]
}