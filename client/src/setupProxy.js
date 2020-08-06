const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
    app.use(
        createProxyMiddleware(["/api", "/ws"], {
            target: "http://localhost:8080",
            proxyTimeout: 1000000,
            timeout: 1000000,
            ws: true,
        }),
    );
};
