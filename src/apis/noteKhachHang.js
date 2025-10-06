import api from "../axios";

export const apiCreateNoteKhachHang = (khachHangId, data) =>{
    return api({
        url:`/notekhachhang/${khachHangId}/notes`,
        method:"post",
        data,
    });
};
export const  apiGetNoteKhachHang= (khachHangId)=>{
    return api({
        url:`/noteKhachHang/${khachHangId}`,
        method:"get",
    });
};