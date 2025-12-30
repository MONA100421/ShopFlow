import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { API_BASE } from "../../config";

// ✅ 简单 token 读写（先不搞太复杂）
const TOKEN_KEY = "token";

function readToken() {
    try {
        return localStorage.getItem(TOKEN_KEY) || "";
    } catch {
        return "";
    }
}

function writeToken(token) {
    try {
        if (token) localStorage.setItem(TOKEN_KEY, token);
        else localStorage.removeItem(TOKEN_KEY);
    } catch { }
}

// ✅ 登录
export const signin = createAsyncThunk(
    "auth/signin",
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const resp = await fetch(`${API_BASE}/api/auth/signin`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await resp.json().catch(() => ({}));
            if (!resp.ok) return rejectWithValue(data?.message || "Login failed");

            const token = data?.token || "";
            if (!token) return rejectWithValue("No token returned from server");

            writeToken(token);

            // 有些后端会返回 user 信息（可选）
            return { token, user: data?.user || null };
        } catch (e) {
            return rejectWithValue(e?.message || "Login failed");
        }
    }
);

// ✅ 注册（如果你后端有 signup）
export const signup = createAsyncThunk(
    "auth/signup",
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const resp = await fetch(`${API_BASE}/api/auth/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await resp.json().catch(() => ({}));
            if (!resp.ok) return rejectWithValue(data?.message || "Signup failed");

            // 有的 signup 会直接给 token；没有也没关系
            const token = data?.token || "";
            if (token) writeToken(token);

            return { token, user: data?.user || null };
        } catch (e) {
            return rejectWithValue(e?.message || "Signup failed");
        }
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState: {
        token: readToken(),
        user: null,
        loading: false,
        error: "",
    },
    reducers: {
        logout(state) {
            state.token = "";
            state.user = null;
            state.error = "";
            writeToken("");
        },
        clearAuthError(state) {
            state.error = "";
        },
        setUser(state, action) {
            state.user = action.payload || null;
        },
    },
    extraReducers: (b) => {
        b.addCase(signin.pending, (state) => {
            state.loading = true;
            state.error = "";
        });
        b.addCase(signin.fulfilled, (state, action) => {
            state.loading = false;
            state.token = action.payload?.token || "";
            state.user = action.payload?.user || null;
        });
        b.addCase(signin.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Login failed";
        });

        b.addCase(signup.pending, (state) => {
            state.loading = true;
            state.error = "";
        });
        b.addCase(signup.fulfilled, (state, action) => {
            state.loading = false;
            state.token = action.payload?.token || state.token;
            state.user = action.payload?.user || state.user;
        });
        b.addCase(signup.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Signup failed";
        });
    },
});

export const { logout, clearAuthError, setUser } = authSlice.actions;
export default authSlice.reducer;
