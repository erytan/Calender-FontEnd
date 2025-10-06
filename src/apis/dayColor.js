import api from "../axios";

export const apiGetDayConfig = async (day) => {
      return api.get(`dayColor/${day}`); 
};

export const apiUpdateDayConfig = async (day, data) => {
    api({
        url: `dayColor/${day}`,
        method: "put",
        data,
    });

};
export const apiCreateDayConfig = async (day) => {
    api({
        url: "dayColor/create-dayconfig",
        method: "post",
        data: { day },
    });
};