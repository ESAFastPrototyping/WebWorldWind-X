import { WebWorker } from './WebWorker.js';

export class Workers {

    /**
     * Gets the number of logical CPU cores.
     * @returns {Number}
     */
    static getCoreCount() {
        return window.navigator.hardwareConcurrency || 2;
    }

    /**
     * @alias Workers
     * @constructor
     * @param {*} Loader a webpack worker-loader
     * @param {Number} numWorkers Maximum number of wokers to use
     */
    constructor(Loader, numWorkers) {
        
        this.workers = [];
        this.queue = [];

        this.onWorkerSuccess = this.onWorkerSuccess.bind(this);
        this.onWorkerError = this.onWorkerError.bind(this);
        
        for (let i = 0; i < numWorkers; i++) {
            this.workers.push(new WebWorker(Loader, this.onWorkerSuccess, this.onWorkerError));
        }
    }

    /**
     * Queues some work to be proccessed by a web worker.
     * 
     * @param {*} data The data to send to the worker
     * @param {Function} cb A callback function to call with the result from the worker
     */
    process(data, cb) {
        const entry = {
            id: this.generateId(),
            processed: false,
            dataToSend: data,
            cb: cb,
        };

        this.queue.push(entry);

        this.processMoreRequests();
    }

    /**
     * Terminates all the web workers.
     */
    terminate() {
        this.workers.forEach(worker => worker.stop());
    }

    onWorkerSuccess(response, workId) {
        const err = response.err ? new Error(response.err) : null;
        this.onWorkerResponse(err, response, workId);
    }

    onWorkerError(err, workId) {
        this.onWorkerResponse(new Error(err.message, err.filename, err.lineno), null, workId);
    }

    onWorkerResponse(error, response, workId) {
        this.processMoreRequests();

        const index = this.queue.findIndex(entry => entry.id === workId);
        if (index === -1) {
            return;
        }
        const entry = this.queue[index];
        this.queue.splice(index, 1);
        if (entry.cb) {
            entry.cb(error, response);
        }
    }

    processMoreRequests() {
        if (!this.queue.length) {
            return;
        }

        const idleWorker = this.getIdleWorker();
        
        if (!idleWorker) {
            return;
        }

        const entry = this.getQueueEntry();

        if (!entry) {
            return;
        }

        idleWorker.postMessage(entry.dataToSend, entry.id);
        entry.processed = true;
    }

    getIdleWorker() {
        return this.workers.find(worker => !worker.inProgress);
    }

    getQueueEntry() {
        return this.queue.find(entry => !entry.processed);
    }

    generateId() {
        return window.crypto.getRandomValues(new Uint32Array(1))[0];
    }
}
