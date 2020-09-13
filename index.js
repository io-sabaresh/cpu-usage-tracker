'use strict';

const shell = require('shelljs');
const cron = require("node-cron");
const pidUsage = require('pidusage');
const findProcess = require('find-process');

const PORT_TO_MONITOR = 5100;
const PM2_PROCESS_NAME = 'Task-1';
const CPU_THRESHOLD = 70; // in %

cron.schedule("* * * * *", async () => {
    try {
        // Find the Process details of a specific PORT
        const process = await findProcess('port', PORT_TO_MONITOR);

        // If the PORT is free without any process
        if (!process.length) throw `Port ${PORT_TO_MONITOR} is free!`;

        // Find the Statistics of a process id (cpu & memory usage etc.,)
        const stats = await pidUsage(process[0].pid);

        if (stats && stats.cpu > CPU_THRESHOLD) {
            shell.exec(`pm2 restart ${PM2_PROCESS_NAME}`, function (code, output) {
                console.log('Exit code:', code);
                console.log('Program output:', output);
            });
        } else {
            console.log("CPU Usage is below threshold: ", stats.cpu);
        }
    } catch (error) {
        console.log("Error: ", error);
    }
}).start();