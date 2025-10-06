import { useState,useEffect  } from "react";
import Home from "./home/home";
import { WebPet } from "./pet/pet";
const Test = () => {
    useEffect(() => {
        const pet = new WebPet(); // khởi tạo pet khi component mount
        window.pet = pet; // tuỳ chọn: để debug từ console

        // cleanup khi unmount
        return () => {
            if (pet.stopMoving) pet.stopMoving();
            const el = document.getElementById("web-pet");
            if (el) el.remove();
        };
    }, []);
    return (
        <Home />

    )
}
export default Test;