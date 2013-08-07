Function.prototype.getHashCode = (function(id) {
    return function() {
        if (!this.hashCode) {
            this.hashCode = '<hash|#' + (id++) + '>';
        }
        return this.hashCode;
    }
}(0));