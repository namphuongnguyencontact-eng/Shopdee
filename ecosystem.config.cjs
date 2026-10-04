module.exports = {
  apps: [
    {
      name: 'shopdee',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      cwd: 'c:/Users/Administrator/Shopdee',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
