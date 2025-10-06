import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsis, faPlus } from "@fortawesome/free-solid-svg-icons";
import { apiCreateKhachHang, apiGetKhachHang, apiUpdateKhachHang } from "../../apis/khacHang";
import { apiGetNoteKhachHang } from "../../apis/noteKhachHang";
import { apiGetDayConfig, apiUpdateDayConfig } from "../../apis/dayColor";
import NotePopup from "./poupAddNote";
import "./style.css";

const DayCard = ({ day, khachHangs, setKhachHangs }) => {
  const [bgColor, setBgColor] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [tenKhachHang, setTenKhachHang] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDayTags, setShowDayTags] = useState(false);
  const [removingTaskId, setRemovingTaskId] = useState(null);
  const [selectedDays, setSelectedDays] = useState({
    thu2: false,
    thu3: false,
    thu4: false,
    thu5: false,
    thu6: false,
    thu7: false,
    cN: false,
  });
  const colors = [
    { code: "#FBF9F1", name: "Kem nhạt" },
    { code: "#F6F9F7", name: "Xanh ngọc nhạt" },
    { code: "#F3F8FB", name: "Xanh da trời nhạt" },
    { code: "#F8F5FA", name: "Tím pastel" },
  ];
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskNotes, setTaskNotes] = useState({});
  const handleNoteUpdateSuccess = (taskId, newNote) => {
    setTaskNotes((prevNotes) => ({
      ...prevNotes,
      [taskId]: newNote,
    }));
    
  };
  const dayLabels = {
    thu2: "Thứ 2",
    thu3: "Thứ 3",
    thu4: "Thứ 4",
    thu5: "Thứ 5",
    thu6: "Thứ 6",
    thu7: "Thứ 7",
    cN: "Chủ nhật",
  };

  const dayKeyMap = {
    Monday: "thu2",
    Tuesday: "thu3",
    Wednesday: "thu4",
    Thursday: "thu5",
    Friday: "thu6",
    Saturday: "thu7",
    Sunday: "cN",
  };
  const [closing, setClosing] = useState(false);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      setSelectedTask(null);
    }, 300); // thời gian bằng transition
  };


  // Tải dữ liệu và màu nền từ database
  // Đặt sau useEffect hiện tại
  useEffect(() => {
    if (!day || !day.name) return;

    const key = dayKeyMap[day.name];
    if (!key) return;

    // Lọc các task dựa trên trạng thái khachHangs mới nhất
    const filteredTasks = khachHangs.filter(
      (kh) => kh.ngayTrongTuan?.[key]?.value === 1 && kh.ngayTrongTuan?.[key]?.active
    );
    const fetchBgColor = async ()=>{
      try{
        const res = await apiGetDayConfig(day.name);
        if(res.success && res.data?.bgColor){
          setBgColor(res.data.bgColor);
        }
      }catch(err){
        console.error("Lỗi khi tải màu nền", err);
      }
    }
    if(day&& day.name){
      fetchBgColor();
    }
    setTasks(
      filteredTasks.map((kh) => ({
        id: kh._id,
        name: kh.tenKhachhang,
        ngayTrongTuan: kh.ngayTrongTuan,
      }))
    );

    const fetchNotes = async () => {
      const notesMap = {};
      for (const task of filteredTasks) {
        try {
          const noteRes = await apiGetNoteKhachHang(task._id);
          notesMap[task._id] =
            noteRes.success && noteRes.data ? noteRes.data.text || "" : "";
        } catch (err) {
          notesMap[task._id] = "";
        }
      }
      setTaskNotes(notesMap);
    };

    if (filteredTasks.length > 0) {
      fetchNotes();
    }

  }, [khachHangs, day.name, day]); // Thêm khachHangs vào dependency array

  const toggleDay = (dayKey) => {
    setSelectedDays((prev) => ({ ...prev, [dayKey]: !prev[dayKey] }));
  };

  // Xử lý thay đổi màu và lưu vào database
  const handleColorChange = async (color) => {
    setBgColor(color);
    setShowMenu(false);

    try {
      const res = await apiUpdateDayConfig(day.name, { bgColor: color });
      console.log("Update color response:", res); // Log để debug
      alert("Cập nhật màu nền thành công");
    } catch (err) {
      console.error("Lỗi khi cập nhật màu nền:", err.message);
      alert("Lỗi khi cập nhật màu nền: " + err.message);
    }
  };

  const handleCreateKhachHang = async () => {
    if (!tenKhachHang.trim()) return alert("Tên khách hàng không được để trống");
    const hasSelectedDay = Object.values(selectedDays).some((val) => val === true);
    if (!hasSelectedDay) {
      return alert("Vui lòng chọn ít nhất một ngày làm việc!!")
    }

    const ngayTrongTuan = Object.fromEntries(
      Object.entries(selectedDays).map(([key, val]) => [key, {
        value: val ? 1 : 0, active: true,
        date: val ? getDateOfWeek(key) : null
      }])
    );

    setLoading(true);
    try {
      await apiCreateKhachHang({ tenKhachhang: tenKhachHang.trim(), ngayTrongTuan });
      alert("Thêm khách hàng thành công");

      setTenKhachHang("");
      setSelectedDays({
        thu2: false,
        thu3: false,
        thu4: false,
        thu5: false,
        thu6: false,
        thu7: false,
        cN: false,
      });
      setShowModal(false);

      const res = await apiGetKhachHang();
      setKhachHangs(res.data || []);
    } catch (err) {
      alert("Thêm khách hàng thất bại: " + err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleToggleDone = async (taskId) => {
    try {
      setRemovingTaskId(taskId);

      // Lấy key của ngày hiện tại (vd: "thu2")
      const dayKey = dayKeyMap[day.name];

      // Update chỉ đúng ngày đó
      const res = await apiUpdateKhachHang(
        {
          ngayTrongTuan: {
            [dayKey]: { active: false }
          }
        },
        taskId
      );

      if (res.success) {
        setTimeout(() => {
          setKhachHangs((prev) =>
            prev.map((kh) =>
              kh._id === taskId
                ? {
                  ...kh,
                  ngayTrongTuan: {
                    ...kh.ngayTrongTuan,
                    [dayKey]: {
                      ...kh.ngayTrongTuan[dayKey],
                      active: false
                    }
                  }
                }
                : kh
            )
          );
          setRemovingTaskId(null);
        }, 300);
      } else {
        setRemovingTaskId(null);
        alert(res.message || "Cập nhật thất bại!");
      }
    } catch (err) {
      console.error("Lỗi cập nhật khách hàng:", err);
      setRemovingTaskId(null);
      alert("Có lỗi xảy ra khi cập nhật khách hàng!");
    }
  };

  const handleUpdateSuccess = (updatedTask) => {
    setKhachHangs((prevKhachHangs) =>
      prevKhachHangs.map((kh) =>
        kh._id === updatedTask.id ? { ...kh, ...updatedTask } : kh
      )
    );
  };
  const getDateOfWeek = (dayKey) => {
    const today = new Date();
    const currentDay = today.getDay(); // Chủ nhật = 0, Thứ 2 = 1, ..., Thứ 7 = 6

    const map = {
      thu2: 1,
      thu3: 2,
      thu4: 3,
      thu5: 4,
      thu6: 5,
      thu7: 6,
      cN: 0
    };

    const targetDay = map[dayKey];
    const diff = targetDay - currentDay;

    // lấy ra ngày trong tuần (nếu diff < 0 tức là tuần sau)
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + diff + (diff < 0 ? 7 : 0));

    return targetDate.toISOString().split("T")[0]; // yyyy-mm-dd
  };

  return (
    <div className="day-card" style={{ backgroundColor: bgColor }}>
      <div className="day-header">
        <h2>
          <span className={` daysaas
            ${bgColor === "#F8F5FA" ? "task-purple" : ""} 
           ${bgColor === "#FBF9F1" ? "task-gold" : ""}
           ${bgColor === "#F6F9F7" ? "task-green" : ""}
            ${bgColor === "#F3F8FB" ? "task-blue" : ""}`}>
            {day.name}
          </span>
          <span className="task-count">{tasks.length}</span>
        </h2>
        <div className="header-actions">
          <div className="change-color" onClick={() => setShowMenu(!showMenu)}>
            <FontAwesomeIcon icon={faEllipsis} />
            {showMenu && (
              <div className="color-menu">
                {colors.map((c, idx) => (
                  <div className="color-option-item" key={idx}>
                    <div
                      className="color-option"
                      style={{ backgroundColor: c.code }}
                      onClick={() => handleColorChange(c.code)}
                    ></div>
                    <span className="color-name">{c.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="add-task" onClick={() => setShowModal(true)}>
            <FontAwesomeIcon icon={faPlus} />
          </div>
        </div>
      </div>

      {/* Modal thêm khách hàng */}
      <div className={`modal-overlay ${showModal ? "show" : ""}`} onClick={() => setShowModal(false)}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <h3>Thêm khách hàng mới</h3>
          <div className="name-sksa">
            <span className="akshjdka">Tên khách hàng: </span>
            <input
              className="asdkjzzz"
              type="text"
              placeholder="Tên khách hàng"
              value={tenKhachHang}
              onChange={(e) => setTenKhachHang(e.target.value)}
            />
          </div>
          <div className="day-tags-container">
            <span className="label-day-tags">Chọn ngày làm:</span>
            <div
              className="selected-days"
              onClick={() => setShowDayTags(!showDayTags)}
            >
              {Object.entries(selectedDays).some(([_, val]) => val)
                ? Object.entries(selectedDays).map(([key, val]) =>
                  val && (
                    <div key={key} className="tag">
                      {dayLabels[key]}
                    </div>
                  )
                )
                : <span className="placeholder">Trống...</span>}
            </div>
          </div>
          {showDayTags && (
            <div className="day-tags">
              {Object.keys(dayLabels).map((key) => (
                <button
                  key={key}
                  type="button"
                  className={selectedDays[key] ? "tag selected" : "tag"}
                  onClick={() => toggleDay(key)}
                >
                  {dayLabels[key]}
                </button>
              ))}
            </div>
          )}
          <div className="modal-actions">
            <button onClick={handleCreateKhachHang} disabled={loading}>
              {loading ? "Đang lưu..." : "Thêm"}
            </button>
            <button onClick={() => setShowModal(false)} disabled={loading}>
              Hủy
            </button>
          </div>
        </div>
      </div>

      {/* Danh sách task */}
      <div className="task-list">
        <div className="task-top">
          {tasks.map((task) => (
            <div key={task.id}
              className={`task-item ${removingTaskId === task.id ? "removing" : ""}`}
            >
              <input type="checkbox"
                onChange={() => handleToggleDone(task.id)}
              />
              <div
                className="task-name"
                onClick={() => setSelectedTask(task)}
                title={taskNotes[task.id] || "Không có ghi chú"}
              >
                {task.name}
                <div className="task-note">
                  Note: <div className="task-notes">{taskNotes[task.id]}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="task-bottom">
          <div className={`task-add 
           ${bgColor === "#F8F5FA" ? "task-purple" : ""} 
           ${bgColor === "#FBF9F1" ? "task-gold" : ""}
           ${bgColor === "#F6F9F7" ? "task-green" : ""}
            ${bgColor === "#F3F8FB" ? "task-blue" : ""}`

          }
            onClick={() => setShowModal(true)}>+ Task mới</div>
        </div>
      </div>

      {/* Popup thêm note */}
      <div
        className={`sidebar-overlay ${selectedTask ? "active" : ""} ${closing ? "closing" : ""}`}
        onClick={handleClose}
      >
        <div
          className={`sidebar-panel ${selectedTask ? "open" : ""} ${closing ? "closing" : ""}`}
          onClick={(e) => e.stopPropagation()}
        >
          {selectedTask && !closing && (
            <NotePopup
              task={selectedTask}
              onClose={handleClose}
              onUpdateSuccess={handleUpdateSuccess}
              onNoteUpdateSuccess={handleNoteUpdateSuccess}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DayCard;