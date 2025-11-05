import { Attachment } from "~/types/resources";

interface BrandProps {
  brand: Attachment;
  withoutText?: boolean;
}

export default function Brand({ brand, withoutText = false }: BrandProps) {
  return (
    <div className="flex items-center gap-1">
      <img src={brand.url} alt={brand.description} className="w-8 h-6" />
      {withoutText ? null : (
        <h1 className="font-sans font-semibold uppercase tracking-wide text-sm text-white">
          Visual Ennode
        </h1>
      )}
    </div>
  );
}
