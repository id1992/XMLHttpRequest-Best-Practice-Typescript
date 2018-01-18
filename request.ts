/**
 * 요청 옵션
 * - 캐쉬 여부
 * - 헤더 
 * - 타임 아웃
 */
interface RequestOptions {
    ignoreCache?: boolean;
    headers?: { [key: string]: string };
    // 0 (or negative) to wait forever
    timeout?: number;
}

//
export const DEFAULT_REQUEST_OPTIONS = {
    ignoreCache: false,
    headers: {
        'Accept': 'application/json, text/javascript, text/plain',
    },
    // default max duration for a request
    timeout: 5000,
};

export interface Response {
    ok: boolean;
    status: number;
    statusText: string;
    data: string;
    json: <T>() => T;
    headers: string,
}

/**
 * 객체를 쿼리문으로 만듦
 * @param params Query 객체
 */
function queryParams(params: any = {}) {
    return Object.keys(params)
        .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
        .join('&');
}

/**
 * 전체 URL을 만듦
 * @param url 스키마 + 도메인네임
 * @param params 쿼리 객체
 */
function withQuery(url: string, params: any = {}) {
    const queryString = queryParams(params);
    return queryString ? url + (url.indexOf('?') === -1 ? '?' : '&') + queryString : url;
}

function parseXHRResult(xhr: XMLHttpRequest): Response {
    return {
        ok: xhr.status >= 200 && xhr.status < 300,
        status: xhr.status,
        statusText: xhr.statusText,
        headers: xhr.getAllResponseHeaders(),
        data: xhr.responseText,
        json: <T>() => JSON.parse(xhr.responseText) as T,
    };
}

function errorResponse(xhr: XMLHttpRequest, message: string | null = null): Response {
    return {
        ok: false,
        status: xhr.status,
        statusText: xhr.statusText,
        headers: xhr.getAllResponseHeaders(),
        data: message || xhr.statusText,
        json: <T>() => JSON.parse(message || xhr.statusText) as T,
    };
}

export function request(method: 'get' | 'post',
    url: string,
    queryParams: any = {},
    body: any = null,
    options: RequestOptions = DEFAULT_REQUEST_OPTIONS) {

    const ignoreCache = options.ignoreCache || DEFAULT_REQUEST_OPTIONS.ignoreCache;
    const headers = options.headers || DEFAULT_REQUEST_OPTIONS.headers;
    const timeout = options.timeout || DEFAULT_REQUEST_OPTIONS.timeout;

    var result = new Promise<Response>((resolve, reject) => {
        let requestCompleted = false;
        let timeoutHandle: NodeJS.Timer;
        const xhr = new XMLHttpRequest();
        xhr.open(method, withQuery(url, queryParams));

        if (headers) {
            Object.keys(headers).forEach(key => xhr.setRequestHeader(key, headers[key]));
        }

        if (ignoreCache) {
            xhr.setRequestHeader('Cache-Control', 'no-cache');
        }

        xhr.onload = evt => {
            if (timeoutHandle) clearTimeout(timeoutHandle);
            requestCompleted = true;
            resolve(parseXHRResult(xhr));
        }

        xhr.onerror = evt => {
            if (timeoutHandle) clearTimeout(timeoutHandle);
            requestCompleted = true;
            resolve(errorResponse(xhr, 'Failed to make request.'));
        }

        if (timeout > 0) {
            timeoutHandle = setTimeout(() => {
                if (!requestCompleted) {
                    resolve(errorResponse(xhr, 'Request took longer than expected.'));
                }
            }, timeout);
        }

        if (method === 'post' && body) {
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify(body));
        } else {
            xhr.send();
        }
    });

    return result;
}