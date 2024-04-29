import { toAudio } from '../../lib/converter.js';

let handler = async (m, { conn, usedPrefix, command }) => {
    try {
        const q = m.quoted || m;
        const mime = (m.quoted ? m.quoted : m.msg).mimetype || '';

        if (!/video|audio/.test(mime)) {
            return m.reply(`Reply to a video/voice note to convert to audio/mp3 with caption *${usedPrefix + command}*`);
        }

        const media = await q.download?.();
        if (!media) {
            return m.reply("Can't download media");
        }

        const audio = await toAudio(media, 'mp4');
        if (!audio.data) {
            return m.reply("Can't convert media to audio");
        }

        conn.sendFile(m.chat, audio.data, 'audio.mp3', '', m, null, {
            mimetype: 'audio/mp4'
        });
    } catch (error) {
        m.reply('Failed to convert video/voice note to audio/mp3. Please try again later.');
        console.error(error);
    }
};

handler.help = ['toaudio'];
handler.tags = ['audio'];
handler.command = /^to(mp3|a(udio)?)$/i;

export default handler;
