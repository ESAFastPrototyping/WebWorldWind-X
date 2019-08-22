export class WebWorker {

    /**
     * @alias WebWorker
     * @constructor
     * @param {*} Loader a webpack worker-loader
     * @param {Function} onMessage 
     * @param {Function} onError 
     */
    constructor(Loader, onMessage, onError) {
        this.Loader = Loader;
        
        this.inProgress = false;
        
        this.workId = null;
        
        this.worker = null;

        this.terminateTimeout = null;

        this.onMessage = this.onMessage.bind(this);
        this.onError = this.onError.bind(this);

        this.onMessageCallback = onMessage;
        this.onErrorCallback = onError;
    }

    /**
     * Sends data to the web worker.
     * 
     * @param {*} data 
     * @param {*} id 
     */
    postMessage(data, id) {
        if (!this.worker) {
            this.start();
        }
        this.worker.postMessage(data);
        this.inProgress = true;
        this.workId = id;
    }

    /**
     * Initializes a web worker.
     */
    start() {
        if (this.worker) {
            return;
        }
        this.worker = new this.Loader();
        this.bindEvents();
    }

    /**
    * Terminates a web worker.
    */
    stop() {
        if (this.worker) {
            if (this.inProgress) {
                this.scheduleTerminate();
                return false;
            }
            this.unbindEvents();
            this.worker.terminate();
            this.worker = null;
            this.inProgress = false;
        }
        return true;
    }

    bindEvents() {
        this.worker.addEventListener('message', this.onMessage, false);
        this.worker.addEventListener('error', this.onError, false);
    }

    unbindEvents() {
        this.worker.removeEventListener('message', this.onMessage);
        this.worker.removeEventListener('error', this.onError);
    }

    scheduleTerminate() {
        clearTimeout(this.terminateTimeout);
        this.terminateTimeout = setTimeout(() => {
            this.stop();
        }, 5000);
    }

    onMessage(e) {
        this.inProgress = false;
        this.onMessageCallback(e.data, this.workId);
    }

    onError(e) {
        this.inProgress = false;
        this.onErrorCallback(e, this.workId);
    }

}