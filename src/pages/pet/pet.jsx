import "./pet.css";
import idleGif from "./gifs/testz.gif";
import runGif from "./gifs/testz.gif";
import houseGif from "./gifs/house.gif";

export class WebPet {
    constructor() {
        this.state = "run"; // run | idle | sleep
        this.direction = "right";
        this.speed = 100; // pixel per step
        this.interval = null;

        this.actions = { idle: idleGif, run: runGif, sleep: houseGif };
        this.createPet();
        this.startMoving();
        this.checkTime(); // kiểm tra giờ mỗi phút
        window.addEventListener("resize", () => this.onResize());
    }
    onResize() {
        if (!this.petEl) return;

        const petWidth = this.petEl.offsetWidth;
        const screenWidth = window.innerWidth;
        const currentLeft = parseFloat(getComputedStyle(this.petEl).left) || 0;

        // Nếu vịt bị vượt mép phải
        if (currentLeft + petWidth > screenWidth) {
            this.petEl.style.left = `${screenWidth - petWidth}px`;
            this.direction = "left";
            this.petEl.style.transform = "scaleX(-1)";
        }

        // Nếu vịt bị lệch ra ngoài bên trái
        if (currentLeft < 0) {
            this.petEl.style.left = "0px";
            this.direction = "right";
            this.petEl.style.transform = "scaleX(1)";
        }
    }

    createPet() {
        this.petEl = document.createElement("div");
        this.petEl.id = "web-pet";
        this.setAction("run");
        document.body.appendChild(this.petEl);

        this.petEl.addEventListener("click", () => this.onClick());
    }

    setAction(action) {
        if (this.state === "sleep") return; // khi ngủ thì không đổi action
        this.state = action;
        this.petEl.style.backgroundImage = `url('${this.actions[action]}')`;
    }
    moveStep() {
        if (this.state !== "run") return;

        const currentLeft = parseFloat(getComputedStyle(this.petEl).left) || 0;
        const petWidth = this.petEl.offsetWidth;
        const screenWidth = window.innerWidth;

        let newLeft = currentLeft;

        if (this.direction === "right") {
            // di chuyển tới vách
            if (currentLeft + petWidth < screenWidth) {
                newLeft = Math.min(currentLeft + this.speed, screenWidth - petWidth);
                this.petEl.style.left = `${newLeft}px`;

                // Nếu vừa CHẠM vào vách phải (sát rìa)
                if (newLeft + petWidth >= screenWidth) {
                    this.direction = "left";
                    this.petEl.style.transform = "scaleX(-1)";
                }
            }
        } else {
            // di chuyển về trái
            if (currentLeft > 0) {
                newLeft = Math.max(currentLeft - this.speed, 0);
                this.petEl.style.left = `${newLeft}px`;

                // Nếu vừa CHẠM vào mép trái
                if (newLeft <= 0) {
                    this.direction = "right";
                    this.petEl.style.transform = "scaleX(1)";
                }
            }
        }
    }


    startMoving() {
        if (this.interval) clearInterval(this.interval);
        this.interval = setInterval(() => this.moveStep(), 2000);
    }

    stopMoving() {
        clearInterval(this.interval);
        this.interval = null;
    }
    showHouse() {
        if (document.getElementById("web-house")) return;
        const house = document.createElement("div");
        house.id = "web-house";
        house.style.backgroundImage = `url('${houseGif}')`;
        document.body.appendChild(house);
        house.classList.add("house-up");

        this.stopMoving();
        this.setAction("run");
        this.direction = "left";
        this.petEl.style.transform = "scaleX(-1)";
        this.petEl.style.left = "50px";

        setTimeout(() => {
            this.petEl.style.opacity = "0";
        }, 2000);
    }

    hideHouse() {
        const house = document.getElementById("web-house");
        if (!house) return;

        this.petEl.style.opacity = "1";
        this.petEl.style.left = "50px";
        this.petEl.style.transform = "scaleX(1)";

        house.classList.add("house-down");
        setTimeout(() => house.remove(), 2000);
    }

    say(text) {
        const bubble = document.createElement("div");
        bubble.className = "pet-bubble";
        bubble.innerText = text;
        document.body.appendChild(bubble);

        const rect = this.petEl.getBoundingClientRect();
        bubble.style.left = rect.left + rect.width / 2 + "px";
        bubble.style.top = rect.top - 40 + "px";

        setTimeout(() => bubble.remove(), 3000);
    }

    onClick() {
        if (this.state === "sleep") return;

        if (!this.clickCount) this.clickCount = 0;
        this.clickCount++;

        const oldBubble = document.querySelector(".pet-bubble");
        if(oldBubble) oldBubble.remove();

        this.stopMoving();
        this.setAction("idle");
        if (this.clickCount === 1) {
            this.say("❤️");

        } else {
            this.say("Cố lên 💪")
            this.clickCount = 0;
        }

        setTimeout(() => {
            this.setAction("run");
            this.startMoving();
        }, 3000);
    }
    sleep() {
        this.stopMoving();
        this.setAction("sleep");
        this.showHouse();
    }

    wakeUp() {
        this.hideHouse();
        this.setAction("run");
        this.startMoving();
    }
    checkTime() {
        const now = new Date();
        const h = now.getHours();
        const m = now.getMinutes();

        // 🌙 Ngủ từ 15:52 trở đi
        if ((h > 15 || (h === 15 && m >= 56)) && this.state !== "sleep") {
            this.sleep();
        }
        // 🌞 Thức từ 7:30 sáng đến trước 15:52
        else if (
            ((h === 7 && m >= 30) || (h > 7 && (h < 15 || (h === 15 && m < 52)))) &&
            this.state === "sleep"
        ) {
            this.wakeUp();
        }

        setTimeout(() => this.checkTime(), 60000); // kiểm tra mỗi phút
    }
}
