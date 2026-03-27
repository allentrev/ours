export const getRefData = async (pWebPage) => {
    console.log("getRefData v2", pWebPage);

    try {
        let wReply = [];
        let wURL = "";
        if (pWebPage) {
            wURL = `${
                import.meta.env.VITE_BACKEND_URL
            }/refData/webPage/${pWebPage}`;
        } else {
            wURL = `${import.meta.env.VITE_BACKEND_URL}/refData/`;
        }
        const res = await fetch(
            // @ts-ignore
            wURL,
            {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                body: null,
            }
        );
        const data = await res.json();
        if (res.ok) {
            if (pWebPage) {
                for (let wItem of data) {
                    let wValue = wItem.value;
                    wReply.push(wValue);
                }
                return wReply;
            } else {
                return data;
            }
        } else {
            console.log("getRefData fail", res);
            return [];
        }
    } catch (err) {
        throw new Error(`getRefData try-catch fail ${err}`);
    }
};
