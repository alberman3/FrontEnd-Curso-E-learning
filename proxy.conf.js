const PROXY_CONFIG = [
  {
    context: ['/auth', '/courses', '/modules', '/lessons', '/enrollments', '/categories','/topics', '/posts', '/reviews', '/users'],
    target: 'http://localhost:8080',
    secure: false,
    logLevel: 'debug',
    changeOrigin: true
  }
];

module.exports = PROXY_CONFIG;
