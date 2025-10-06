import React, { useState, useEffect } from "react";
import { apiCreateNoteKhachHang, apiGetNoteKhachHang } from "../../apis/noteKhachHang";
import { apiUpdateKhachHang } from "../../apis/khacHang";
import "./style.css"; // Giả định bạn sẽ thêm CSS tại đây

const NotePopup = ({ task, onClose, onUpdateSuccess, onNoteUpdateSuccess }) => {
  const [note, setNote] = useState(""); // State cho ghi chú
  const [customerName, setCustomerName] = useState(task.name || ""); // Giá trị mặc định từ task.name
  const [workDays, setWorkDays] = useState(task.ngayTrongTuan || {}); // Giá trị mặc định từ task.ngayTrongTuan
  const [loading, setLoading] = useState(false);
  const [loadingNote, setLoadingNote] = useState(true); // State để xử lý loading ghi chú

  // Đồng bộ workDays với task.ngayTrongTuan và tải ghi chú từ database
  useEffect(() => {
    setWorkDays(task.ngayTrongTuan || {});

    // Lấy ghi chú từ database khi task thay đổi
    const fetchNote = async () => {
      try {
        setLoadingNote(true);
        const noteRes = await apiGetNoteKhachHang(task.id); // Gọi API với task.id
        if (noteRes.success && noteRes.data) {
          setNote(noteRes.data.text || ""); // Lấy text từ response
        } else {
          setNote(""); // Nếu không có dữ liệu, đặt note rỗng
        }
      } catch (err) {
        setNote(""); // Đặt note rỗng nếu có lỗi
      } finally {
        setLoadingNote(false);
      }
    };

    if (task && task.id) {
      fetchNote();
    }
  }, [task]); // Sử dụng [task] để chạy khi task thay đổi hoàn toàn

  if (!task) return null; // Chưa có task thì không render

  const handleSave = async () => {
    if (!note.trim()) {
      alert("Vui lòng nhập nội dung ghi chú!");
      return;
    }
    setLoading(true);
    try {
      // Gửi yêu cầu thêm ghi chú
      const noteRes = await apiCreateNoteKhachHang(task.id, { text: note });
      if (noteRes.success === true) {
        alert("Thêm ghi chú thành công!");

        if (onNoteUpdateSuccess) {
          onNoteUpdateSuccess(task.id, note);
        }
      } else {
        alert(noteRes.data.error || "Có lỗi xảy ra khi thêm ghi chú");
        return; // Dừng nếu ghi chú thất bại
      }

      // Kiểm tra và gửi yêu cầu cập nhật thông tin khách hàng nếu có thay đổi
      const hasNameChange = customerName.trim() !== (task.name || "").trim();
      const hasWorkDaysChange = JSON.stringify(workDays) !== JSON.stringify(task.ngayTrongTuan || {});

      if (hasNameChange || hasWorkDaysChange) {
        const updateData = {
          tenKhachhang: hasNameChange ? customerName.trim() : undefined,
          ngayTrongTuan: hasWorkDaysChange ? workDays : undefined,
        };
        const updateRes = await apiUpdateKhachHang(updateData, task.id);
        if (updateRes.success === true) {
          const updatedTask = {
            id: task.id,
            tenKhachhang: customerName.trim(),
            name: customerName || task.name,
            ngayTrongTuan: workDays,
          };
          if (onUpdateSuccess) onUpdateSuccess(updatedTask);
        } else {
          alert(updateRes.data.message || "Có lỗi xảy ra khi cập nhật khách hàng");
        }
      }

      onClose(); // Đóng panel sau khi hoàn tất
    } catch (err) {
      alert("Không thể thêm ghi chú hoặc cập nhật khách hàng!");
    } finally {
      setLoading(false);
    }
  };

  const handleWorkDayChange = (day) => {
    setWorkDays((prev) => ({
      ...prev,
      [day]: prev[day] ? 0 : 1, // Toggle giữa 0 và 1
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

  return (
    <div className="sidebar-overlaysa">
      <div className="sidebar-panel">
        <h3>Thêm ghi chú và cập nhật cho {task.name}</h3>
        {/* Input cho ghi chú */}
        <textarea
          value={note} // Hiển thị nội dung note, không cần "Đang tải..." vì panel luôn hiển thị khi đã load
          onChange={(e) => setNote(e.target.value)}
          placeholder="Nhập ghi chú..."
          disabled={loadingNote} // Vô hiệu hóa khi đang tải
          style={{ width: "100%", margin: "10px 0", padding: "5px" }} // Thêm style để hiển thị tốt hơn
          title={note} // Hiển thị toàn bộ text khi hover (nếu dài)
        />
        {/* Input cho tên khách hàng */}
        <input
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Tên khách hàng..."
          style={{ width: "100%", margin: "10px 0", padding: "5px" }}
        />
        {/* Chọn ngày làm việc - giống DayCard */}
        <div className="day-tags-container">
          <span className="label-day-tags">Chọn ngày làm:</span>
          <div className="selected-days">
            {Object.entries(workDays).map(
              ([key, val]) =>
                val === 1 && (
                  <div key={key} className="tag">
                    {dayLabels[key]}
                  </div>
                )
            )}
          </div>
        </div>
        <div className="day-tags">
          {Object.keys(dayLabels).map((key) => (
            <button
              key={key}
              type="button"
              className={workDays[key] === 1 ? "tag selected" : "tag"}
              onClick={() => handleWorkDayChange(key)}
            >
              {dayLabels[key]}
            </button>
          ))}
        </div>
        <div className="modal-actions">
          <button onClick={handleSave} disabled={loading || loadingNote}>
            {loading ? "Đang lưu..." : "Lưu"}
          </button>
          <button onClick={onClose} disabled={loading || loadingNote}>
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotePopup;