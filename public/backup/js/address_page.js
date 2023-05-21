const input_room_no = document.querySelector("#room");

function ChangeValue() {
    if (parseInt(this.value)) {
        if (this.value.length > this.maxLength) {
            this.value = this.value.slice(0, this.maxLength);
        }
        if (this.value < 0) {
            this.value = this.value.slice(1, this.maxLength+1);
        }
        if (this.value > 750) {
            this.value = 750;
        }
    }
}

input_room_no.addEventListener("input", ChangeValue);
