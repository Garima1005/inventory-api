import ImageKit from "@imagekit/nodejs";

const imagekit = new ImageKit({
    privateKey:process.env.IMAGEKIT_PRIVATE_KEY
});

export async function uploadFile(buffer : Buffer, name: string) {
  const result = await imagekit.files.upload({
    file: buffer.toString("base64"),
    fileName: name
  });

  return result;
}

