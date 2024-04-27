import fetch from 'node-fetch';
import cheerio from 'cheerio';
import { URL } from 'url';
import { sticker } from '../../lib/sticker.js';

const emojiGraph = async (url) => {
    try {
        const response = await fetch(url);
        const html = await response.text();
        const $ = cheerio.load(html);
        const emojiData = $('.emoji__title').get().map((element) => {
            const elm = $(element);
            const emojiName = elm.find('.emoji').text();
            const emojiLink = elm.siblings('.emoji__copy').find('.emoji').text();
            const emojiDescription = elm.siblings('p').text();
            const vendors = elm.siblings('.emoji__div__tablet').find('.block__emoji').get().map((vendorElement) => {
                const em = $(vendorElement);
                const vendorName = em.find('a').text();
                const vendorLink = em.find('a')?.attr('href');
                const vendorImage = em.find('img')?.attr('data-src');
                return { name: vendorName, link: vendorLink ? 'https://emojigraph.org' + vendorLink : null, image: vendorImage ? 'https://emojigraph.org' + vendorImage : null };
            });
            return { name: emojiName, link: emojiLink, description: emojiDescription, vendors };
        });
        return emojiData;
    } catch (error) {
        console.error('Error in emojiGraph:', error);
        throw error;
    }
};

const searchEmoji = async (q) => {
    try {
        const response = await fetch(`https://emojigraph.org/id/search/?q=${q}&searchLang=id`);
        const html = await response.text();
        const $ = cheerio.load(html);
        return $('#search__first .s__first__ul a').map((index, element) => 'https://emojigraph.org' + $(element)?.attr('href')).get();
    } catch (error) {
        console.error('Error in searchEmoji:', error);
        throw error;
    }
};

const emojiPedia = async (emoji) => {
  try {
    const getSlug = await fetch(`https://emojipedia.org/${encodeURIComponent(emoji)}`, { redirect: 'follow' });
    const outSlug = new URL(getSlug.url).pathname.startsWith('/') ? new URL(getSlug.url).pathname.substring(1) : new URL(getSlug.url).pathname;
    const fragments = `
      fragment vendorAndPlatformResource on VendorAndPlatform {
        slug
        title
        description
        items {
          date
          slug
          title
          image {
            source
            description
            useOriginalImage
          }
        }
      }

      fragment shortCodeResource on Shortcode {
        code
        vendor {
          slug
          title
        }
      }

      fragment emojiResource on Emoji {
        id
        title
        code
        slug
        currentCldrName
        codepointsHex
        description
        modifiers
        appleName
        alsoKnownAs
        shortcodes {
          ...shortCodeResource
        }
        proposals {
          name
          url
        }
      }

      fragment emojiDetailsResource on Emoji {
        ...emojiResource
        type
        socialImage {
          source
        }
        emojiVersion {
          name
          date
          slug
          status
        }
        version {
          name
          slug
          date
          description
          status
        }
        components {
          ...emojiResource
        }
        goesGreatWith {
          ... on Emoji {
            title
            slug
            code
            currentCldrName
            description
          }
          ... on StaticContent {
            title
            slug
            titleEmoji {
              code
              title
              currentCldrName
              description
              slug
            }
          }
        }
        genderVariants {
          slug
          title
          currentCldrName
        }
        skinTone
        skinToneVariants {
          slug
          skinTone
          code
          title
          currentCldrName
        }
        vendorsAndPlatforms {
          ...vendorAndPlatformResource
        }
        alerts {
          name
          content
          notes
          link
          representingEmoji {
            code
          }
        }
        alert {
          content
          link
          representingEmoji {
            code
            slug
          }
        }
        shortcodes {
          code
          source
          vendor {
            slug
            title
          }
        }
        shopInfo {
          ... on ShopInfo {
            url
            image
          }
        }
      }
    `;

    const query = `
      query emojiV1($slug: Slug!, $lang: Language) {
        emoji_v1(slug: $slug, lang: $lang) {
          ...emojiDetailsResource
        }
      }
    `;

    const response = await fetch("https://emojipedia.org/api/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: fragments + query,
        variables: {
          slug: outSlug,
          lang: "EN",
        },
      }),
    });

    const data = await response.json();
    const result = data?.data?.emoji_v1?.vendorsAndPlatforms;
    const output = result?.map((v) => ({ name: v.title || v.slug || null, description: v.description || v.items?.[0]?.title || null, image: 'https://em-content.zobj.net/' + v.items?.[0]?.image?.source || null })) ?? [];
    return output;
    
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
};

const NotoEmoji = async (query) => {
    try {
        const codePoint = Array.from(query)[0]?.codePointAt(0)?.toString(16);
        return codePoint ? `https://fonts.gstatic.com/s/e/notoemoji/latest/${codePoint}/512.webp` : null;
    } catch (error) {
        console.error("Error getting NotoEmoji:", error);
        return null;
    }
};

const EmojiGG = async (query) => {
    const q = query?.toLowerCase()?.trim()?.split(" ")?.join("_");
    try {
        const response = await fetch("https://emoji.gg/api/");
        const data = await response.json();
        return data.filter(s => s.title == q || s.title?.includes(q))?.length ? data.filter(s => s.title == q || s.title?.includes(q)) : null;
    } catch (error) {
        console.error("Error getting EmojiGG:", error);
        return null;
    }
};

const handler = async (m, { args, usedPrefix, command }) => {
    try {
        if (!args[0]) return m.reply('Silakan masukkan *emoji* atau perintah yang benar.');
        switch (command) {
            case 'emo':
            case 'emoji':
            case 'emojis':
                const url = await searchEmoji(args[0]);
                const res = await emojiGraph(url[0]);
                const emojiData = res[0].vendors;
                if (!emojiData.length) return m.reply('Emoji tidak ditemukan atau input tidak valid. Silakan coba lagi.');
                if (!args[1]) return m.reply(`Daftar vendor untuk *${args[0]}*:\n\n${emojiData.map((data, index) => `*${index + 1}.* ${data.name}`).join('\n')}\n\nContoh: *${usedPrefix + command}* [emoji] [vendor]`);
                const vendorIndex = parseInt(args[1]) - 1;
                if (isNaN(vendorIndex) || vendorIndex < 0 || vendorIndex >= emojiData.length) return m.reply(`Indeks vendor tidak valid. Harap berikan nomor yang valid dari angka 1 sampai ${emojiData.length}.`);
                const vendorData = emojiData[vendorIndex];
                m.reply(`Informasi emoji untuk *${args[0]}* (${vendorData.name}):\n\n*Url:* ${vendorData.link}\n*Gambar:* ${vendorData.image}`);
                return m.reply(await sticker(false, vendorData.image, packname, m.name));
                break;
            case 'notoemoji':
                const emojiUrl = await NotoEmoji(args[0]);
                if (emojiUrl) return m.reply(emojiUrl);
                else return m.reply('Gagal mendapatkan URL emoji.');
                break;
            case 'emojigg':
                const emojiGgData = await EmojiGG(args[0]);
                if (!emojiGgData.length) return m.reply('Emoji tidak ditemukan atau input tidak valid. Silakan coba lagi.');
                if (!args[1]) return m.reply(`Daftar vendor untuk *${args[0]}*:\n\n${emojiGgData.map((data, index) => `*${index + 1}.* ${data.title}`).join('\n')}\n\nContoh: *${usedPrefix + command}* [emoji] [vendor]`);
                const vendorGgIndex = parseInt(args[1]) - 1;
                if (isNaN(vendorGgIndex) || vendorGgIndex < 0 || vendorGgIndex >= emojiGgData.length) return m.reply(`Indeks vendor tidak valid. Harap berikan nomor yang valid dari angka 1 sampai ${emojiGgData.length}.`);
                const vendorGgData = emojiGgData[vendorGgIndex];
                m.reply(`Informasi emoji untuk *${args[0]}* (${vendorGgData.title}):\n\n*Description:* ${vendorGgData.description}\n*Gambar:* ${vendorGgData.image}`);
                return m.reply(await sticker(false, vendorGgData.image, packname, m.name));
                break;
            case 'emojipedia':
                const emojiPeData = await emojiPedia(args[0]);
                if (!emojiPeData.length) return m.reply('Emoji tidak ditemukan atau input tidak valid. Silakan coba lagi.');
                if (!args[1]) return m.reply(`Daftar vendor untuk *${args[0]}*:\n\n${emojiPeData.map((data, index) => `*${index + 1}.* ${data.name}`).join('\n')}\n\nContoh: *${usedPrefix + command}* [emoji] [vendor]`);
                const vendorPeIndex = parseInt(args[1]) - 1;
                if (isNaN(vendorPeIndex) || vendorPeIndex < 0 || vendorPeIndex >= emojiPeData.length) return m.reply(`Indeks vendor tidak valid. Harap berikan nomor yang valid dari angka 1 sampai ${emojiPeData.length}.`);
                const vendorPeData = emojiPeData[vendorPeIndex];
                m.reply(`Informasi emoji untuk *${args[0]}* (${vendorPeData.name}):\n\n*Description:* ${vendorPeData.description}\n*Gambar:* ${vendorPeData.image}`);
                return m.reply(await sticker(false, vendorPeData.image, packname, m.name));
                break;
        }
    } catch (error) {
        console.error('Error fetching or parsing data:', error);
        return m.reply('Terjadi kesalahan saat mencari data emoji.');
    }
};

handler.help = ['emoji', 'notoemoji', 'emojigg', 'emojipedia'];
handler.tags = ['sticker'];
handler.command = /^(emo(jis|(ji)?)|notoemoji|emojigg|emojipedia)$/i;
export default handler;
