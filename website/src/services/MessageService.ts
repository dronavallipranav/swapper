import api from "./AxiosInterceptor";

export const sendMessage = async (
  target: string,
  text: string
): Promise<string> => {
  const r = await api.post<{
    id: string;
  }>("/messages", {
    recipientID: target,
    text,
  });
  return r.data.id;
};
