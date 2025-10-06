import { useState, useEffect } from "react";
import { apiGetNoteKhachHang } from "../apis/noteKhachHang";
import { apiGetKhachHang, apiUpdateKhachHang } from "../apis/khacHang"; // ✅ thêm apiUpdateKhachHang
import "./doneTask.css";

const DoneTable = ({ khachHangs, setKhachHangs }) => {
  const [taskNotes, setTaskNotes] = useState({});
  const [removingId, setRemovingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const dayLabels = {
    thu2: "Monday",
    thu3: "Tuesday",
    thu4: "Wednesday",
    thu5: "Thursday",
    thu6: "Friday",
    thu7: "Saturday",
    cN: "Sunday",
  };
  // ✅ Lấy danh sách khách hàng done từ props
  const doneList = khachHangs.flatMap((k) =>
    Object.entries(k.ngayTrongTuan || {})
      .filter(([_, val]) => val.active === false) // chỉ lấy ngày done
      .map(([dayKey, val]) => ({
        ...k,
        dayKey,
        dayLabel: dayLabels[dayKey] || dayKey, // đổi key thành label
        value: val, // { value: 1, active: false }
      }))
  );
  useEffect(() => {
    const fetchNotes = async () => {
      const noteMap = {};
      for (const kh of doneList) {
        try {
          const resNote = await apiGetNoteKhachHang(kh._id);
          if (Array.isArray(resNote.data)) {
            noteMap[kh._id] = resNote.data;
          } else if (resNote.data) {
            noteMap[kh._id] = [resNote.data];
          } else {
            noteMap[kh._id] = [];
          }
        } catch (err) {
          noteMap[kh._id] = [];
        }
      }
      setTaskNotes(noteMap);
    };

    if (doneList.length > 0) fetchNotes();
  }, [khachHangs]);

  const handleRestore = async (id, dayKey) => {
    try {
      setRemovingId(id);
      const res = await apiUpdateKhachHang(
        { ngayTrongTuan: { [dayKey]: { active: true } } },
        id
      );

      if (res.success) {
        setTimeout(() => {
          setKhachHangs((prev) =>
            prev.map((kh) =>
              kh._id === id
                ? {
                  ...kh,
                  ngayTrongTuan: {
                    ...kh.ngayTrongTuan,
                    [dayKey]: {
                      ...kh.ngayTrongTuan[dayKey],
                      active: true,
                    },
                  },
                }
                : kh
            )
          );
          setRemovingId(null);
        }, 300);
      } else {
        setRemovingId(null);
        alert(res.message || "Khôi phục thất bại!");
      }
    } catch (err) {
      setRemovingId(null);
      alert("Có lỗi khi khôi phục khách hàng!");
    }
  };

  const totalPages = Math.ceil(doneList.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const currentItems = doneList.slice(startIdx, startIdx + itemsPerPage)

  if (doneList.length === 0) return <p>Chưa có task done</p>;

  return (
    <div className="done-table">
      <h2>Khách hàng Done</h2>

      {/* Chọn số item mỗi trang */}
      <div className="pagination-controls">
        <label>
          Hiển thị:
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1); // reset về page 1
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
            <option value={25}>25</option>
            <option value={100}>100</option>
          </select>
          dòng / trang
        </label>
      </div>

      {/* Bảng */}
      <table>
        <thead>
          <tr>
            <th></th>
            <th>Tên khách hàng</th>
            <th>Ghi chú</th>
            <th>Ngày cập nhật</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((k) => (
            <tr key={`${k._id}-${k.dayKey}`}>
              <td>
                <input type="checkbox" onChange={() => handleRestore(k._id, k.dayKey)} />
                <td className="alsdkjdas">
                  <div className="ksad">
                    {k.dayLabel}
                  </div>
                  <div className="sdatea">
                    {k.value.date
                      ? new Date(k.value.date).toLocaleDateString("vi-VN")
                      : "-"}
                  </div>

                </td> {/* ✅ hiển thị Monday... Sunday */}
              </td>
              <td>{k.tenKhachhang}</td>
              <td>
                {taskNotes[k._id]?.length > 0 ? (
                  <ul>
                    {taskNotes[k._id].map((note, idx) => (
                      <li key={note._id || idx}>
                        {note.noiDung || note.text || "-"}
                      </li>
                    ))}
                  </ul>
                ) : (
                  "-"
                )}
              </td>
              <td>{new Date(k.updatedAt).toLocaleDateString("vi-VN")}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Nút phân trang */}
      <div className="pagination">
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
        >
          « Trước
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
          <button
            key={num}
            className={num === currentPage ? "active" : ""}
            onClick={() => setCurrentPage(num)}
          >
            {num}
          </button>
        ))}
        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Sau »
        </button>
      </div>
    </div>
  );
};
export default DoneTable;
