import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CookieJar, Prisma } from '@prisma/client';

export type PersistedCookie = {
  id: string;
  name: string;
  value: string;
  domain: string;
  path: string;
  expires: Date | null;
  httpOnly: boolean;
  secure: boolean;
};

@Injectable()
export class CookieJarService {

  constructor(private prisma: PrismaService) {}

  extractDomain(url: string): string {
    try {
      const { hostname } = new URL(url);
      return hostname.replace(/^www\./, '');
    } catch {
      return url;
    }
  }

  parseSetCookieHeader(header: string): {
    name: string;
    value: string;
    domain?: string;
    path: string;
    expires?: Date;
    httpOnly: boolean;
    secure: boolean;
  } | null {
    const parts = header.split(';').map((p) => p.trim());
    const first = parts[0];
    if (!first) return null;

    const eqIdx = first.indexOf('=');
    if (eqIdx === -1) return null;

    const name = first.slice(0, eqIdx).trim();
    const value = first.slice(eqIdx + 1).trim();
    if (!name) return null;

    let domain: string | undefined;
    let path = '/';
    let expires: Date | undefined;
    let httpOnly = false;
    let secure = false;

    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      const lower = part.toLowerCase();

      if (lower === 'httponly') {
        httpOnly = true;
      } else if (lower === 'secure') {
        secure = true;
      } else if (lower.startsWith('domain=')) {
        domain = part.slice(7).replace(/^\./, '');
      } else if (lower.startsWith('path=')) {
        path = part.slice(5) || '/';
      } else if (lower.startsWith('expires=')) {
        const d = new Date(part.slice(8));
        if (!isNaN(d.getTime())) expires = d;
      } else if (lower.startsWith('max-age=')) {
        const seconds = parseInt(part.slice(8), 10);
        if (!isNaN(seconds)) {
          expires = new Date(Date.now() + seconds * 1000);
        }
      }
    }

    return { name, value, domain, path, expires, httpOnly, secure };
  }

  async getCookieHeaderForUrl(userId: string, url: string): Promise<string | null> {
    const requestDomain = this.extractDomain(url);
    const now = new Date();

    const allCookies = await this.prisma.cookieJar.findMany({
      where: {
        userId,
        OR: [{ expires: null }, { expires: { gt: now } }],
      },
    });

    const applicable = allCookies.filter((c) => this.domainMatches(c.domain, requestDomain));
    if (applicable.length === 0) return null;

    return applicable.map((c) => `${c.name}=${c.value}`).join('; ');
  }

  domainMatches(cookieDomain: string, requestDomain: string): boolean {
    if (cookieDomain === requestDomain) return true;
    return requestDomain.endsWith(`.${cookieDomain}`);
  }

  async persistCookiesFromResponse(
    userId: string,
    requestUrl: string,
    headers: Headers,
  ): Promise<PersistedCookie[]> {
    const requestDomain = this.extractDomain(requestUrl);
    const setCookieHeaders = headers.getSetCookie();
    if (setCookieHeaders.length === 0) return [];

    const results: PersistedCookie[] = [];

    for (const header of setCookieHeaders) {
      const parsed = this.parseSetCookieHeader(header);
      if (!parsed) continue;

      const effectiveDomain = parsed.domain ?? requestDomain;
      const isExpired = parsed.expires !== undefined && parsed.expires <= new Date();

      if (isExpired) {
        await this.prisma.cookieJar.deleteMany({
          where: { userId, domain: effectiveDomain, name: parsed.name, path: parsed.path },
        });
      } else {
        const upserted = await this.prisma.cookieJar.upsert({
          where: {
            userId_domain_name_path: {
              userId,
              domain: effectiveDomain,
              name: parsed.name,
              path: parsed.path,
            },
          },
          update: {
            value: parsed.value,
            expires: parsed.expires ?? null,
            httpOnly: parsed.httpOnly,
            secure: parsed.secure,
          },
          create: {
            userId,
            domain: effectiveDomain,
            name: parsed.name,
            value: parsed.value,
            path: parsed.path,
            expires: parsed.expires ?? null,
            httpOnly: parsed.httpOnly,
            secure: parsed.secure,
          },
        });
        results.push(upserted);
      }
    }
    return results;
  }
}
