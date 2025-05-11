const configCors =cors({
        origin:'http://localhost:3000',
        methods:["POST","GET"],
    });

module.exports = configCors;