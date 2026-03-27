// utilities/refDataUtils.ts
import type { RefDataRecord } from "../types/refDataTypes";

/**
 * Fetches all refData records from the backend.
 */
export const getAllRefData = async (): Promise<RefDataRecord[]> => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/refData/`;

    try {
        const res = await fetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        const data = await res.json();
        return res.ok ? (data as RefDataRecord[]) : [];
    } catch (err) {
        throw new Error(`getAllRefData error: ${err}`);
    }
};

/**
 * Fetches only the `value` fields from refData records for a given web page.
 */
export const getRefDataValuesByPage = async (
    webPage: string
): Promise<string[]> => {
    if (!webPage) throw new Error("webPage parameter is required.");

    const url = `${
        import.meta.env.VITE_BACKEND_URL
    }/refData/webPage/${webPage}`;
    console.log("getRefDataValuesByPage", webPage);
    try {
        const res = await fetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        const data = await res.json();
        return res.ok
            ? (data as RefDataRecord[]).map((item) => item.value)
            : [];
    } catch (err) {
        throw new Error(`getRefDataValuesByPage error: ${err}`);
    }
};

export const createRefData = async (
    item: RefDataRecord
): Promise<RefDataRecord> => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/refData`;

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item),
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Failed to create refData: ${errorText}`);
        }

        return await res.json();
    } catch (err) {
        throw new Error(`createRefData error: ${err}`);
    }
};

export const updateRefData = async (
    updatedRecord: RefDataRecord
): Promise<RefDataRecord> => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/refData/${
        updatedRecord.refKey
    }`;

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedRecord),
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Failed to update refData: ${errorText}`);
        }
        return await res.json();
    } catch (err) {
        throw new Error(`updateRefData error: ${err}`);
    }
};

export const updateAllRefData = async (
    updatedRecords: RefDataRecord[]
): Promise<void> => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/refData/updateMany`;

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedRecords),
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Failed to update all refData: ${errorText}`);
        }
    } catch (err) {
        throw new Error(`updateAllRefData error: ${err}`);
    }
};

/**
 * Deletes a refData record by its refKey.
 */
export const deleteRefData = async (refKey: string): Promise<void> => {
    if (!refKey) throw new Error("refKey is required for deletion.");

    const url = `${import.meta.env.VITE_BACKEND_URL}/refData/${refKey}`;

    try {
        const res = await fetch(url, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Failed to delete refData: ${errorText}`);
        }
    } catch (err) {
        throw new Error(`deleteRefData error: ${err}`);
    }
};
