import QRCode from 'qrcode';

export const EVENT_QR_LIMITS = {
	city: 120,
	event: 120,
} as const;

const QR_OPTIONS: QRCode.QRCodeToStringOptions = {
	type: 'svg',
	width: 280,
	margin: 2,
	color: { dark: '#000000', light: '#ffffff' },
};

export function parseParamString(v: string | string[] | undefined): string {
	if (v === undefined) {
		return '';
	}
	const s = Array.isArray(v) ? v[0] : v;
	return typeof s === 'string' ? s.trim() : '';
}

export function paramOn(v: string | string[] | undefined): boolean {
	const s = parseParamString(v);
	return s === '1' || s === 'true';
}

export function isAllowedLumaUrl(url: string): boolean {
	const t = url.trim();
	if (t.length === 0 || t.length > 2048) {
		return false;
	}
	try {
		const u = new URL(t);
		if (u.protocol !== 'https:' && u.protocol !== 'http:') {
			return false;
		}
		const h = u.hostname.toLowerCase();
		if (h === 'lu.ma' || h.endsWith('.lu.ma')) {
			return true;
		}
		if (h === 'luma.com' || h.endsWith('.luma.com')) {
			return true;
		}
		return false;
	} catch {
		return false;
	}
}

export function validateEventQrFields(
	city: string,
	eventType: string,
	lumaUrl: string,
): { ok: true; city: string; eventType: string; lumaUrl: string } | { ok: false } {
	const c = city.slice(0, EVENT_QR_LIMITS.city).trim();
	const e = eventType.slice(0, EVENT_QR_LIMITS.event).trim();
	const l = lumaUrl.trim();
	if (c.length === 0 || e.length === 0 || !isAllowedLumaUrl(l)) {
		return { ok: false };
	}
	return { ok: true, city: c, eventType: e, lumaUrl: l };
}

export function generateEventQrSvg(lumaUrl: string): Promise<string> {
	return QRCode.toString(lumaUrl, QR_OPTIONS);
}

export function buildEventQrQuery(params: {
	city: string;
	event: string;
	luma: string;
	light?: boolean;
	print?: boolean;
}): string {
	const p = new URLSearchParams();
	p.set('city', params.city);
	p.set('event', params.event);
	p.set('luma', params.luma);
	if (params.light) {
		p.set('light', '1');
	}
	if (params.print) {
		p.set('print', '1');
	}
	return p.toString();
}
