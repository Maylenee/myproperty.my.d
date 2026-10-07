import apartmentImage from "@/assets/property-apartment.jpg";
import houseImage from "@/assets/property-modern-house.jpg";
import kostImage from "@/assets/property-kost.jpg";
import landImage from "@/assets/property-land.jpg";
import shophouseImage from "@/assets/property-shophouse.jpg";
import villaImage from "@/assets/property-villa.jpg";
import warehouseImage from "@/assets/property-warehouse.jpg";
import { supabase } from "@/integrations/supabase/client";

// Built-in sample photos are stored in the database as "asset:<key>" tokens,
// because bundled file URLs change between builds.
const assets: Record<string, string> = {
  "modern-house": houseImage,
  apartment: apartmentImage,
  villa: villaImage,
  land: landImage,
  shophouse: shophouseImage,
  kost: kostImage,
  warehouse: warehouseImage,
};

const reverse = new Map(Object.entries(assets).map(([k, v]) => [v, `asset:${k}`]));

export function decodePhoto(value: string) {
  return value.startsWith("asset:") ? (assets[value.slice(6)] ?? houseImage) : value;
}

export function encodePhoto(url: string) {
  return reverse.get(url) ?? url;
}

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

/** Uploads a listing photo to cloud storage and returns a long-lived URL. */
export async function uploadPropertyPhoto(file: File): Promise<string | null> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${auth.user.id}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("property-photos").upload(path, file, { contentType: file.type });
  if (error) return null;
  const { data } = await supabase.storage.from("property-photos").createSignedUrl(path, TEN_YEARS);
  return data?.signedUrl ?? null;
}
