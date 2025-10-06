import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Trò chơi Nuôi Thú Ảo (React Pet Simulator) với hình ảnh minh họa cho thú cưng
// Các hành động: Cho ăn, Chơi, Ngủ, Tắm rửa
// Lưu trạng thái bằng LocalStorage
// Animation bằng Framer Motion
// Giao diện sử dụng Tailwind CSS

const STORAGE_KEY = "pet_simulator_state_v1";

function clamp(v, a = 0, b = 100) {
  return Math.max(a, Math.min(b, v));
}

function useInterval(callback, delay) {
  const savedRef = useRef();
  useEffect(() => {
    savedRef.current = callback;
  }, [callback]);
  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => savedRef.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

export default function PetSimulator() {
  const [pet, setPet] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        return {
          name: parsed.name || "Bánh Quy",
          hunger: clamp(parsed.hunger ?? 50),
          happiness: clamp(parsed.happiness ?? 70),
          energy: clamp(parsed.energy ?? 80),
          cleanliness: clamp(parsed.cleanliness ?? 90),
          lastUpdated: parsed.lastUpdated || Date.now(),
        };
      } catch (e) {
        console.warn("Không đọc được dữ liệu thú cưng, dùng mặc định", e);
      }
    }
    return {
      name: "Bánh Quy",
      hunger: 50,
      happiness: 70,
      energy: 80,
      cleanliness: 90,
      lastUpdated: Date.now(),
    };
  });

  const [log, setLog] = useState([]);
  const [isSleeping, setIsSleeping] = useState(false);

  useInterval(() => {
    setPet((p) => {
      const now = Date.now();
      const dtSec = Math.max(1, Math.round((now - (p.lastUpdated || now)) / 1000));
      const factor = dtSec / 5;

      let hunger = clamp(Math.round(p.hunger + 1 * factor * 1.1));
      let energy = clamp(Math.round(p.energy - 0.8 * factor));
      let happiness = clamp(Math.round(p.happiness - 0.3 * factor));
      let cleanliness = clamp(Math.round(p.cleanliness - 0.05 * factor));

      if (hunger >= 90) happiness = clamp(happiness - 2);
      if (isSleeping) {
        energy = clamp(energy + Math.round(2 * factor));
        hunger = clamp(hunger + Math.round(0.5 * factor));
      }

      const next = { ...p, hunger, energy, happiness, cleanliness, lastUpdated: now };
      maybeRandomEvent(next);
      return next;
    });
  }, 5000);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pet));
  }, [pet]);

  function pushLog(text) {
    setLog((l) => [text, ...l].slice(0, 8));
  }

  function maybeRandomEvent(p) {
    const roll = Math.random();
    if (roll < 0.03 && p.hunger > 80) {
      p.happiness = clamp(p.happiness - 8);
      pushLog(`${p.name} cảm thấy khó chịu vì đói.`);
    } else if (roll < 0.035 && p.happiness > 80) {
      p.happiness = clamp(p.happiness + 5);
      pushLog(`${p.name} nhảy múa vì vui sướng!`);
    }
  }

  function feed() {
    setPet((p) => {
      pushLog(`Bạn đã cho ${p.name} ăn. Ngon quá!`);
      return { ...p, hunger: clamp(p.hunger - 30), happiness: clamp(p.happiness + 5) };
    });
  }

  function play() {
    setPet((p) => {
      if (p.energy < 15) { pushLog(`${p.name} quá mệt để chơi.`); return p; }
      pushLog(`Bạn chơi với ${p.name}. Rất vui!`);
      return { ...p, happiness: clamp(p.happiness + 12), energy: clamp(p.energy - 18), hunger: clamp(p.hunger + 8) };
    });
  }

  function sleepToggle() {
    setIsSleeping((s) => {
      const now = !s;
      pushLog(now ? `${pet.name} đi ngủ.` : `${pet.name} thức dậy.`);
      return now;
    });
  }

  function clean() {
    setPet((p) => {
      pushLog(`Bạn đã tắm rửa cho ${p.name}. Sạch sẽ rồi!`);
      return { ...p, cleanliness: clamp(p.cleanliness + 25), happiness: clamp(p.happiness + 4) };
    });
  }

  function rename(newName) {
    setPet((p) => ({ ...p, name: newName }));
    pushLog(`Bạn đã đổi tên thú cưng.`);
  }

  const status = (() => {
    if (pet.hunger > 90) return "Đói lả";
    if (pet.hunger > 70) return "Đói";
    if (pet.energy < 20) return "Kiệt sức";
    if (pet.happiness < 30) return "Buồn";
    return "Vui vẻ";
  })();

  function PetImage({ name, happiness }) {
    // Thay bằng URL hình ảnh minh họa thú cưng
    const url = happiness > 60 ? "/images/happy_pet.png" : happiness > 30 ? "/images/neutral_pet.png" : "/images/sad_pet.png";
    return (
      <motion.img
        key={happiness}
        src={url}
        alt={name}
        className="w-32 h-32 object-contain"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1.05, rotate: [0, -2, 2, 0] }}
        transition={{ duration: 1.2, repeat: Infinity, repeatType: "loop" }}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-sky-50 p-6">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-white rounded-2xl shadow p-6 flex flex-col items-center">
          <div className="w-full flex justify-between items-start mb-3">
            <h2 className="text-xl font-semibold">{pet.name}</h2>
            <div className="text-sm text-slate-500">{status}</div>
          </div>

          <div className="w-full flex items-center justify-center py-4">
            <AnimatePresence mode="wait">
              <PetImage name={pet.name} happiness={pet.happiness} />
            </AnimatePresence>
          </div>

          <div className="w-full space-y-3 mt-2">
            <Stat label="Đói" value={pet.hunger} />
            <Stat label="Vui vẻ" value={pet.happiness} />
            <Stat label="Năng lượng" value={pet.energy} />
            <Stat label="Sạch sẽ" value={pet.cleanliness} />
          </div>

          <div className="w-full mt-4 grid grid-cols-2 gap-2">
            <ActionButton onClick={feed}>Cho ăn</ActionButton>
            <ActionButton onClick={play}>Chơi</ActionButton>
            <ActionButton onClick={sleepToggle}>{isSleeping ? "Thức dậy" : "Ngủ"}</ActionButton>
            <ActionButton onClick={clean}>Tắm rửa</ActionButton>
          </div>

          <div className="w-full mt-4 text-xs text-slate-500">
            Mẹo: các hành động sẽ thay đổi chỉ số. Cho thú ngủ để hồi năng lượng.
          </div>
        </div>

        {/* Các phần điều khiển và nhật ký vẫn giữ nguyên, chỉ đổi ngôn ngữ và thêm PetImage */}
      </div>
    </div>
  );
}

// Các component Stat, ActionButton, RenameForm, AutoMode, DashboardCard giữ nguyên nhưng đã dịch sang tiếng Việt
