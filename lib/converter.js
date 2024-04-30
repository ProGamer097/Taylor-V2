import { promises as fsPromises } from 'fs';
import { join } from 'path';
import crypto from 'crypto';
import Ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import { fileTypeFromBuffer } from "file-type";
import { tmpdir } from "os";

export async function ffmpeg(media, format, options) {
  try {
    const { ext, mime } = await fileTypeFromBuffer(media);
    const tmpFileOut = path.join(tmpdir(), `${crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.${format}`);
    const tmpFileIn = path.join(tmpdir(), `${crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.${ext}`);
  
    await fsPromises.writeFile(tmpFileIn, media);
  
    await new Promise((resolve, reject) => {
      Ffmpeg(tmpFileIn)
      .inputFormat(mime.split('/')[1])
        .on("error", reject)
        .on("end", () => resolve(true))
        .addInput(tmpFileIn)
        .addOutputOptions(...options)
        .save(tmpFileOut);
    });
  
    const buff = await fsPromises.readFile(tmpFileOut);
    await fsPromises.unlink(tmpFileOut);
    await fsPromises.unlink(tmpFileIn);
    return buff;
  } catch (error) {
    throw new Error(`Error in ffmpeg conversion: ${error.message}`);
  }
}

export async function imageToWebp(media) {
  try {
    const { ext, mime } = await fileTypeFromBuffer(media);
    const tmpFileOut = path.join(tmpdir(), `${crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`);
    const tmpFileIn = path.join(tmpdir(), `${crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.${ext}`);
  
    await fsPromises.writeFile(tmpFileIn, media);
  
    await new Promise((resolve, reject) => {
      Ffmpeg(tmpFileIn)
      .inputFormat(mime.split('/')[1])
        .on("error", reject)
        .on("end", () => resolve(true))
        .addInput(tmpFileIn)
        .addOutputOptions([
          "-vcodec",
          "libwebp",
          "-vf",
          "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse",
        ])
        .toFormat('webp')
        .save(tmpFileOut);
    });
  
    const buff = await fsPromises.readFile(tmpFileOut);
    await fsPromises.unlink(tmpFileOut);
    await fsPromises.unlink(tmpFileIn);
    return buff;
  } catch (error) {
    throw new Error(`Error in image to WebP conversion: ${error.message}`);
  }
}

export async function videoToWebp(media) {
  try {
    const { ext, mime } = await fileTypeFromBuffer(media);
    const tmpFileOut = path.join(tmpdir(), `${crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`);
    const tmpFileIn = path.join(tmpdir(), `${crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.${ext}`);
  
    await fsPromises.writeFile(tmpFileIn, media);
  
    await new Promise((resolve, reject) => {
      Ffmpeg(tmpFileIn)
      .inputFormat(mime.split('/')[1])
        .on("error", reject)
        .on("end", () => resolve(true))
        .addInput(tmpFileIn)
        .addOutputOptions([
          "-vcodec", "libwebp",
          "-vf", "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse",
          "-loop", "0",
          "-ss", "00:00:00.0",
          "-t", "00:00:05.0",
          "-preset", "default",
          "-an",
          "-vsync", "0"
        ])
        .toFormat('webp')
        .save(tmpFileOut);
    });
  
    const buff = await fsPromises.readFile(tmpFileOut);
    await fsPromises.unlink(tmpFileOut);
    await fsPromises.unlink(tmpFileIn);
    return buff;
  } catch (error) {
    throw new Error(`Error in video to WebP conversion: ${error.message}`);
  }
}

export async function toPTT(media) {
  try {
    const { ext, mime } = await fileTypeFromBuffer(media);
    const tmpFileOut = path.join(tmpdir(), `${crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.mp3`);
    const tmpFileIn = path.join(tmpdir(), `${crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.${ext}`);
  
    await fsPromises.writeFile(tmpFileIn, media);
  
    await new Promise((resolve, reject) => {
      Ffmpeg(tmpFileIn)
      .inputFormat(mime.split('/')[1])
        .on("error", reject)
        .on("end", () => resolve(true))
        .addInput(tmpFileIn)
        .outputOptions('-vn', '-ab', '128k', '-ar', '44100')
        .toFormat('ogg')
        .save(tmpFileOut);
    });
  
    const buff = await fsPromises.readFile(tmpFileOut);
    await fsPromises.unlink(tmpFileOut);
    await fsPromises.unlink(tmpFileIn);
    return buff;
  } catch (error) {
    throw new Error(`Error in conversion to PTT: ${error.message}`);
  }
}

export async function toAudio(media) {
  try {
    const { ext, mime } = await fileTypeFromBuffer(media);
    const tmpFileOut = path.join(tmpdir(), `${crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.mp3`);
    const tmpFileIn = path.join(tmpdir(), `${crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.${ext}`);
  
    await fsPromises.writeFile(tmpFileIn, media);
  
    await new Promise((resolve, reject) => {
      Ffmpeg(tmpFileIn)
      .inputFormat(mime.split('/')[1])
        .on("error", reject)
        .on("end", () => resolve(true))
        .addInput(tmpFileIn)
        .audioFrequency(44100)
        .audioChannels(2)
        .audioBitrate('128k')
        .audioCodec('libmp3lame')
        .audioQuality(5)
        .toFormat('mp3')
        .save(tmpFileOut);
    });
  
    const buff = await fsPromises.readFile(tmpFileOut);
    await fsPromises.unlink(tmpFileOut);
    await fsPromises.unlink(tmpFileIn);
    return buff;
  } catch (error) {
    throw new Error(`Error in conversion to audio: ${error.message}`);
  }
}

export async function toAudio8k(media) {
  try {
    const { ext, mime } = await fileTypeFromBuffer(media);
    const tmpFileOut = path.join(tmpdir(), `${crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.mp3`);
    const tmpFileIn = path.join(tmpdir(), `${crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.${ext}`);
  
    await fsPromises.writeFile(tmpFileIn, media);
  
    await new Promise((resolve, reject) => {
      Ffmpeg(tmpFileIn)
      .inputFormat(mime.split('/')[1])
        .on("error", reject)
        .on("end", () => resolve(true))
        .addInput(tmpFileIn)
        .audioFilter(['apulsator=hz=0.125'])
        .audioFrequency(44100)
        .audioChannels(2)
        .audioBitrate('128k')
        .audioCodec('libmp3lame')
        .audioQuality(5)
        .toFormat('mp3')
        .save(tmpFileOut);
    });
  
    const buff = await fsPromises.readFile(tmpFileOut);
    await fsPromises.unlink(tmpFileOut);
    await fsPromises.unlink(tmpFileIn);
    return buff;
  } catch (error) {
    throw new Error(`Error in conversion to audio (8k): ${error.message}`);
  }
}

export async function toVideo(media) {
  try {
    const { ext, mime } = await fileTypeFromBuffer(media);
    const tmpFileOut = path.join(tmpdir(), `${crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.mp4`);
    const tmpFileIn = path.join(tmpdir(), `${crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.${ext}`);
  
    await fsPromises.writeFile(tmpFileIn, media);
  
    await new Promise((resolve, reject) => {
      Ffmpeg(tmpFileIn)
      .inputFormat(mime.split('/')[1])
        .on("error", reject)
        .on("end", () => resolve(true))
        .addInput(tmpFileIn)
        .videoCodec('libvpx')
        .videoBitrate(1000, true)
        .outputOptions([
          "-pix_fmt yuv420p",
          "-c:v libx264",
          "-movflags +faststart",
          "-filter:v crop='floor(in_w/2)*2:floor(in_h/2)*2'",
        ])
        .toFormat('mp4')
        .noAudio()
        .save(tmpFileOut);
    });
  
    const buff = await fsPromises.readFile(tmpFileOut);
    await fsPromises.unlink(tmpFileOut);
    await fsPromises.unlink(tmpFileIn);
    return buff;
  } catch (error) {
    throw new Error(`Error in conversion to video: ${error.message}`);
  }
}

export async function toMp4(media) {
  try {
    const { ext, mime } = await fileTypeFromBuffer(media);
    const tmpFileOut = path.join(tmpdir(), `${crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.mp4`);
    const tmpFileIn = path.join(tmpdir(), `${crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.${ext}`);
  
    await fsPromises.writeFile(tmpFileIn, media);
  
    await new Promise((resolve, reject) => {
      Ffmpeg(tmpFileIn)
      .inputFormat(mime.split('/')[1])
        .addInput(tmpFileIn)
        .videoCodec('libvpx')
        .videoBitrate(1000, true)
        .outputOptions(
          '-minrate', '1000',
          '-maxrate', '1000',
          '-threads', '3',
          '-flags', '+global_header',
          '-psnr'
        )
        .on("error", reject)
        .on("end", () => resolve(true))
        .save(tmpFileOut);
    });
  
    const buff = await fsPromises.readFile(tmpFileOut);
    await fsPromises.unlink(tmpFileOut);
    await fsPromises.unlink(tmpFileIn);
    return buff;
  } catch (error) {
    throw new Error(`Error in conversion to MP4: ${error.message}`);
  }
}

export async function videoConvert(media, options = []) {
  try {
    const { ext, mime } = await fileTypeFromBuffer(media);
    const tmpFileOut = path.join(tmpdir(), `${crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.mp4`);
    const tmpFileIn = path.join(tmpdir(), `${crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.${ext}`);
  
    await fsPromises.writeFile(tmpFileIn, media);
  
    await new Promise((resolve, reject) => {
      Ffmpeg(tmpFileIn)
      .inputFormat(mime.split('/')[1])
        .addInput(tmpFileIn)
        .videoCodec('libvpx')
        .videoBitrate(1000, true)
        .outputOptions(
          '-minrate', '1000',
          '-maxrate', '1000',
          '-threads', '3',
          '-flags', '+global_header',
          '-psnr',
          options
        )
        .on("error", reject)
        .on("end", () => resolve(true))
        .save(tmpFileOut);
    });
  
    const buff = await fsPromises.readFile(tmpFileOut);
    await fsPromises.unlink(tmpFileOut);
    await fsPromises.unlink(tmpFileIn);
    return buff;
  } catch (error) {
    throw new Error(`Error in video conversion: ${error.message}`);
  }
}
