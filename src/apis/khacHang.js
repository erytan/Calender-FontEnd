import api from "../axios";

export const apiCreateKhachHang = (data) => 
    api({
        url:"khachhang/create-khachhang",
        method:"post",
        data,
    });
export const apiGetKhachHang = (data) => 
    api({
        url:"khachhang/get-khachhang",
        method:"get",
        data,
    });
export const apiUpdateKhachHang =  (data,sid)=>
    api({
        url:`khachhang/${sid}`,
        method:"put",
        data,
    })