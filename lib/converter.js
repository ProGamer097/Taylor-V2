import { promises } from 'fs';
import { join } from 'path';
import { spawn } from 'child_process';

async function ffmpeg(buffer, args = [], ext = '', ext2 = '') {
    try {
        let tmp = join(global.__dirname(import.meta.url), '../tmp', +new Date() + '.' + ext);
        let out = tmp + '.' + ext2;
        await promises.writeFile(tmp, buffer);
        await spawn('ffmpeg', ['-y', '-i', tmp, ...args, out]);
        await promises.unlink(tmp);
        return {
            data: await promises.readFile(out),
            filename: out,
            delete() {
                return promises.unlink(out);
            }
        };
    } catch (error) {
        throw error;
    }
}

async function toPTT(buffer, ext) {
    try {
        return await ffmpeg(buffer, ['-vn', '-c:a', 'libopus', '-b:a', '128k', '-vbr', 'on'], ext, 'ogg');
    } catch (error) {
        throw error;
    }
}

async function toAudio(buffer, ext) {
    try {
        return await ffmpeg(buffer, ['-vn', '-c:a', 'libopus', '-b:a', '128k', '-vbr', 'on', '-compression_level', '10'], ext, 'opus');
    } catch (error) {
        throw error;
    }
}

async function toVideo(buffer, ext) {
    try {
        return await ffmpeg(buffer, ['-c:v', 'libx264', '-c:a', 'aac', '-ab', '128k', '-ar', '44100', '-crf', '32', '-preset', 'slow'], ext, 'mp4');
    } catch (error) {
        throw error;
    }
}

async function videoConvert(buffer, input = []) {
    try {
        const tmp = join(__dirname, '../tmp', `${+new Date()}.mp4`);
        await promises.writeFile(tmp, buffer);
        const out = tmp.replace('.mp4', '_converted.mp4');
        await spawn('ffmpeg', ['-y', '-i', tmp, ...input, out]);
        await promises.unlink(tmp);
        return await promises.readFile(out);
    } catch (error) {
        throw error;
    }
}

const defaultOptions = ['-hide_banner'];

async function ffmpegCommand(input, output, ...options) {
    try {
        return await ffmpeg(input, [...defaultOptions, ...options], output);
    } catch (error) {
        throw error;
    }
}

async function basicConversion(inputPath, outputExt) {
    try {
        return await ffmpegCommand(inputPath, outputExt);
    } catch (error) {
        throw error;
    }
}

async function cropVideo(inputPath, outputExt, ...cropOptions) {
    try {
        return await ffmpegCommand(inputPath, outputExt, '-filter:v', `crop=${cropOptions.join(':')}`);
    } catch (error) {
        throw error;
    }
}

async function scaleVideo(inputBuffer, scale) {
    try {
        const options = ['-vf', `scale=${scale}`];
        return await ffmpegCommand(inputBuffer, 'mp4', ...options);
    } catch (error) {
        throw error;
    }
}

async function trimVideo(inputPath, outputExt, startTime, endTime) {
    try {
        return await ffmpegCommand(inputPath, outputExt, '-ss', startTime, '-c', 'copy', '-t', endTime);
    } catch (error) {
        throw error;
    }
}

async function convertToFLV(inputPath, outputExt) {
    try {
        return await ffmpegCommand(inputPath, 'flv', '-c:v', 'flv');
    } catch (error) {
        throw error;
    }
}

async function convertToMKV(inputPath, outputExt) {
    try {
        return await ffmpegCommand(inputPath, 'mkv', '-c:v', 'libx264');
    } catch (error) {
        throw error;
    }
}

async function convertToGIF(inputPath, outputExt) {
    try {
        return await ffmpegCommand(inputPath, 'gif', '-c:v', 'gif');
    } catch (error) {
        throw error;
    }
}

async function copyToAAC(inputPath, outputExt) {
    try {
        return await ffmpegCommand(inputPath, 'aac', '-vn', '-acodec', 'copy');
    } catch (error) {
        throw error;
    }
}

async function convertToMP3(inputPath, outputExt) {
    try {
        return await ffmpegCommand(inputPath, 'mp3', '-vn', '-acodec', 'mp3');
    } catch (error) {
        throw error;
    }
}

async function convertToAAC(inputPath, outputExt) {
    try {
        return await ffmpegCommand(inputPath, 'aac', '-vn', '-acodec', 'aac');
    } catch (error) {
        throw error;
    }
}

async function trimAudioToMP3(inputPath, outputExt, startTime, endTime) {
    try {
        return await ffmpegCommand(inputPath, 'mp3', '-ss', startTime, '-t', endTime, '-vn', '-acodec', 'mp3');
    } catch (error) {
        throw error;
    }
}

async function extractFramesToImages(inputPath, outputExt, frameRate) {
    try {
        return await ffmpegCommand(inputPath, 'jpg', '-vf', `fps=${frameRate}`);
    } catch (error) {
        throw error;
    }
}

async function extractFramesToPNG(inputPath, outputExt, frameRate) {
    try {
        return await ffmpegCommand(inputPath, 'png', '-vf', `fps=${frameRate}`);
    } catch (error) {
        throw error;
    }
}

async function addWatermark(inputPath, outputExt, watermarkPath, position) {
    try {
        return await ffmpegCommand(inputPath, outputExt, '-i', watermarkPath, '-filter_complex', `overlay=${position}`, '-codec:a', 'copy');
    } catch (error) {
        throw error;
    }
}

async function mergeVideos(inputPaths, outputExt) {
    try {
        const inputFiles = inputPaths.map((path) => `-i ${path}`).join(' ');
        return await ffmpegCommand(inputFiles, outputExt, '-filter_complex', `concat=n=${inputPaths.length}:v=1:a=1[outv][outa]`, '-map', '[outv]', '-map', '[outa]');
    } catch (error) {
        throw error;
    }
}

async function extractAudio(inputPath, outputExt) {
    try {
        return await ffmpegCommand(inputPath, outputExt, '-vn', '-acodec', 'copy');
    } catch (error) {
        throw error;
    }
}

async function reverseVideo(inputPath, outputExt) {
    try {
        return await ffmpegCommand(inputPath, outputExt, '-vf', 'reverse', '-af', 'areverse');
    } catch (error) {
        throw error;
    }
}

async function resizeImage(inputPath, outputExt, width, height) {
    try {
        return await ffmpegCommand(inputPath, outputExt, '-vf', `scale=${width}:${height}`);
    } catch (error) {
        throw error;
    }
}

async function applyFilterToAudio(inputPath, outputExt, filter) {
    try {
        return await ffmpegCommand(inputPath, outputExt, '-af', filter);
    } catch (error) {
        throw error;
    }
}

async function extractSingleFrame(inputPath, outputExt, time) {
    try {
        return await ffmpegCommand(inputPath, outputExt, '-ss', time, '-vframes', '1');
    } catch (error) {
        throw error;
    }
}

async function extractAudioWaveform(inputPath, outputExt, resolution = 1920) {
    try {
        return await ffmpegCommand(inputPath, outputExt, '-filter_complex', `aformat=channel_layouts=stereo,showwavespic=s=${resolution}x240:colors=0x00FF00`);
    } catch (error) {
        throw error;
    }
}

async function concatenateVideos(inputPaths, outputExt) {
    try {
        const inputFiles = inputPaths.map((path) => `-i ${path}`).join(' ');
        return await ffmpegCommand(inputFiles, outputExt, '-filter_complex', `concat=n=${inputPaths.length}:v=1:a=1[outv][outa]`, '-map', '[outv]', '-map', '[outa]');
    } catch (error) {
        throw error;
    }
}

export {
    ffmpegCommand,
    basicConversion,
    cropVideo,
    scaleVideo,
    trimVideo,
    convertToFLV,
    convertToMKV,
    convertToGIF,
    copyToAAC,
    convertToMP3,
    convertToAAC,
    trimAudioToMP3,
    extractFramesToImages,
    extractFramesToPNG,
    addWatermark,
    mergeVideos,
    extractAudio,
    reverseVideo,
    resizeImage,
    applyFilterToAudio,
    extractSingleFrame,
    extractAudioWaveform,
    concatenateVideos,
    toAudio,
    toPTT,
    toVideo,
    ffmpeg,
    videoConvert
};
