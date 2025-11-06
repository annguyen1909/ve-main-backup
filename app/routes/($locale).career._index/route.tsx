import { Form, Link, MetaFunction, useActionData, useOutletContext } from "@remix-run/react";
import { Container } from "~/components/ui/container";
import { UploadInput } from "~/components/ui/upload-input";
import { AppContext } from "~/root"
import {
  useState, useRef, useEffect
} from "react";
import { Api } from "~/lib/api";
import { ActionFunctionArgs } from "@remix-run/node";
import { toast } from "sonner";
import type { loader as rootLoader } from "~/root";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { cn, title, montserratIfKo } from "~/lib/utils";

export async function action({ request, params }: ActionFunctionArgs) {
  const api = new Api();
  const formData = await request.formData();
  const locale = params.locale ?? 'en';

  const last_name = formData.get("last_name") as string;
  const first_name = formData.get("first_name") as string;
  const middle_name = formData.get("middle_name") as string;
  const email_address = formData.get("email_address") as string;
  const position = formData.get("position") as string;
  const nationality = formData.get("nationality") as string;
  const comment = formData.get("comment") as string;
  const cv = formData.get("cv") as File;
  const portfolio = formData.get("portfolio") as File;

  // if (!first_name || !last_name || !middle_name || !nationality || !position) {
  //   return {
  //     errorCode: 422,
  //   };
  // }

  const data = new FormData();
  data.append("last_name", last_name);
  data.append("first_name", first_name);
  data.append("middle_name", middle_name);
  data.append("email_address", email_address);
  data.append("position", position);
  data.append("nationality", nationality);
  data.append("cv", cv);
  data.append("portfolio", portfolio);
  data.append("comment", comment);


  return await api.sendEmailCVApi(data, locale)
    .then(async () => {
      return {
        errorCode: 0,
      }
    }).catch((err) => {
      if (api.isValidationResponse(err)) {
        return {
          errorCode: 422,
          message: err.response?.data.message,
        };
      }

      if (api.isTooManyRequestsResponse(err)) {
        return {
          errorCode: 429,
        }
      }

      return {
        errorCode: 500,
      }
    })
}

export const meta: MetaFunction<unknown, { "root": typeof rootLoader }> = ({ matches }) => {
  const rootMatch = matches.find((match) => match.id === "root")?.data;

  return [
    { title: title(rootMatch!.translations["career.page.title"]) },
    { name: "description", content: rootMatch!.translations["career.page.description"] },

    { property: "og:title", content: rootMatch!.translations["career.page.og.title"] },
    { property: "og:description", content: rootMatch!.translations["career.page.og.description"] },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://www.visualennode.com/career" },
    { property: "og:image", content: "https://www.visualennode.com/images/og-cover.jpg" },

    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: rootMatch!.translations["career.page.twitter.title"] },
    { name: "twitter:description", content: rootMatch!.translations["career.page.twitter.description"] },
    { name: "twitter:image", content: "https://www.visualennode.com/images/og-cover.jpg" }
  ];
};


export default function Career() {
  const actionData = useActionData<typeof action>();
  const formRef = useRef<HTMLFormElement>(null);
  const { translations: t, brand, locale } = useOutletContext<AppContext>();
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!actionData) return;

    if (actionData.errorCode != 0) {
      let message: string;

      if (actionData.errorCode === 429) {
        message = t['Too many requests, please try again tomorrow'];
      } else if (actionData.errorCode === 422) {
        message = 'message' in actionData ? actionData.message as string : t['Please input all required fields'];
      } else {
        message = t['An unexpected error occurred, please contact us to help'];
      }

      toast.error(message);

      return;
    }

    setSuccess(true);
    formRef.current?.reset();
  }, [actionData, t])

  const [, setFiles] = useState<{ cv: File | null; portfolio: File | null }>({
    cv: null,
    portfolio: null,
  });

  const handleFileSelect = (name: string, file: File | null) => {
    if (name !== "cv" && name !== "portfolio") {
      console.warn(`Unexpected file input name: ${name}`);
      return;
    }

    setFiles((prevFiles) => ({ ...prevFiles, [name]: file }));
  };

  const positions = ["Archviz", "Parttime Archviz", "Editor", "Project Manager"]

  return <div className={locale === "ko" ? "ko-solid" : ""}>
    <div className={cn('fixed inset-0 bg-[#1b1b1b] flex-col justify-between z-10 py-20 px-5 hidden', success && 'flex')}>
      <div></div>
      <div className="flex flex-col items-center" data-koreanable>
        <img
          src={brand.url}
          alt={brand.description}
          className={"w-20 mb-10 lg:w-32 lg:mb-14"}
        />
        <h3 className={`text-[#bcbcbc] text-center font-semibold text-3xl md:text-5xl mb-2 md:mb-5 ${montserratIfKo(t['Thank you for your information'], locale)}`}>{t['Thank you for your information']}</h3>
        <p className="text-[#959595] text-xl md:text-3xl font-light text-center"><span className="md:block">{t['We have received your information,']}</span> {t['we will contact with you soon']}</p>
      </div>

      <div className="flex items-center justify-center">
        <div className="inline-flex items-center text-[#959595]">
          <span className="text-xl mr-4 md:text-3xl md:mr-7">{t['See us at']}</span>
          <div className="flex items-center gap-2 ml-auto">
            <Link to="https://instagram.com/visual_ennode" target="_blank" rel="noopener noreferrer">
              <img src="/images/instagram.svg" className="size-6 md:size-8" alt="Instagram" />
            </Link>
            <Link to="https://www.youtube.com/@visualennode" target="_blank" rel="noopener noreferrer">
              <img src="/images/youtube-square.svg" className="size-6 md:size-8" alt="YouTube" />
            </Link>
            <Link to="https://pf.kakao.com/_ggesn/chat" target="_blank" rel="noopener noreferrer">
              <img src="/images/talk.svg" className="size-6 md:size-8" alt="Talk" />
            </Link>
            <Link to="https://www.facebook.com/profile.php?id=61573221556208" target="_blank" rel="noopener noreferrer">
              <img src="/images/fb.svg" className="size-6 md:size-8" alt="Facebook" />
            </Link>
            <Link to="https://blog.naver.com/visualennode" target="_blank" rel="noopener noreferrer">
              <img src="/images/blog.svg" className="size-6 md:size-8" alt="Blog" />
            </Link>
          </div>
        </div>
      </div>
    </div>
    <section>
      <Container variant={"md"} className="!py-20">
        <div>
          <p className="font-medium text-xl mb-7 text-white" data-koreanable>{t['Current openning']}</p>
          <p className="text-base font-extralight leading-loose text-white" data-koreanable>{t['We always looking for potential designers so don\'t hesitate to send us your portfolio and CV.']}</p>
        </div>

        <h1 className="text-3xl font-medium my-14 text-white" data-koreanable>{t['career.form.title']}</h1>
        <Form method="post" encType="multipart/form-data">
          <div className="flex flex-col md:flex-row gap-4 md:gap-7 items-start">
            <div className="w-full md:w-56 text-base md:text-xl flex-none text-white" data-koreanable>
              {t['career.form.position']} <span className="text-red-600">*</span>
            </div>
            <div className="grow w-full flex flex-col gap-1 text-white">
              {positions.map((pos) => (
                <label key={pos} className="flex items-center font-extralight gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="position"
                    value={pos}
                    onChange={() => setSelectedPositions([pos])}
                    checked={selectedPositions.includes(pos)}
                  />
                  {(t as Record<string, string>)[`career.form.${pos.replace(/\s+/g, "_")}`] || pos}
                </label>
              ))}
            </div>

          </div>

          <div className="flex flex-col gap-4 md:gap-7 items-start mt-14 text-white">
            <div className="w-full text-base md:text-xl flex-none" data-koreanable>
              {t['career.form.full_name']} <span className="text-red-600">*</span>
            </div>
            <div className="grow w-full grid grid-cols-1 sm:grid-cols-3 gap-7">
              <div className="flex flex-col gap-1"><input id="first_name" name="first_name" type="text" className="rounded-none text-lg py-1 bg-transparent outline-none border-b border-[#878787]" spellCheck="false" autoComplete="off" data-koreanable />
                <span className="text-[10px] font-extralight">{t['career.form.first_name']}</span>
              </div>
              <div className="flex flex-col gap-1"><input id="middle_name" name="middle_name" type="text" className="rounded-none text-lg py-1 bg-transparent outline-none border-b border-[#878787]" spellCheck="false" autoComplete="off" data-koreanable />
                <span className="text-[10px] font-extralight">{t['career.form.middle_name']}</span>
              </div>
              <div className="flex flex-col gap-1"><input id="last_name" name="last_name" type="text" className="rounded-none text-lg py-1 bg-transparent outline-none border-b border-[#878787]" spellCheck="false" autoComplete="off" data-koreanable />
                <span className="text-[10px] font-extralight">{t['career.form.last_name']}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 md:gap-7 items-start mt-14">
            <div className="w-full md:w-56 text-base md:text-xl flex-none text-white" data-koreanable>
              {t['career.form.nationality']} <span className="text-red-600">*</span>
            </div>
            <div className="grow w-full flex flex-col gap-1">
              {/* <select defaultValue="vietnam" name="nationality" id="nationality" className="rounded-none outline-none border-b py-1 text-lg border-[#878787] bg-white text-black">
                <option value="vietnam">Vietnam</option>
                <option value="korea">Korea</option>
                <option value="usa">The United States</option>
                <option value="canada">Canada</option>
              </select> */}

              {/* <Select >
                <SelectTrigger className="w-[180px] text-white" >
                  <SelectValue placeholder="Select a fruit" />
                </SelectTrigger>
                <SelectContent className="text-white">
                  <SelectGroup>
                    <SelectLabel>Fruits</SelectLabel>
                    <SelectItem value="apple">Apple</SelectItem>
                    <SelectItem value="banana">Banana</SelectItem>
                    <SelectItem value="blueberry">Blueberry</SelectItem>
                    <SelectItem value="grapes">Grapes</SelectItem>
                    <SelectItem value="pineapple">Pineapple</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select> */}

              <Select defaultValue="korea" name="nationality">
                <SelectTrigger className="w-full text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="w-full text-white bg-black !border-none">
                  <SelectGroup>
                    <SelectItem value="korea">Korea</SelectItem>
                    <SelectItem value="vietnam">Vietnam</SelectItem>
                    <SelectItem value="usa">The United States</SelectItem>
                    <SelectItem value="canada">Canada</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 md:gap-7 items-start mt-14 text-white" data-koreanable>
            <div className="w-full md:w-56 text-base md:text-xl flex-none">
              {t['career.form.email']} <span className="text-red-600">*</span>
            </div>
            <div className="grow w-full flex flex-col gap-1">
              <input id="email_address" name="email_address" type="email" className="rounded-none text-lg py-1 bg-transparent outline-none border-b border-[#878787]" spellCheck="false" autoComplete="off" />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 md:gap-7 items-start mt-14 text-white" data-koreanable>
            <div className="w-full md:w-56 text-base md:text-xl flex-none">
              {t['career.form.portfolio']} <span className="text-red-600">*</span>
            </div>
            <div className="grow w-full flex flex-col gap-1">
              <UploadInput id="portfolio" name="portfolio" onFileSelect={handleFileSelect} />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 md:gap-7 items-start mt-14 text-white" data-koreanable>
            <div className="w-full md:w-56 text-base md:text-xl flex-none">
              {t['career.form.cv']} <span className="text-red-600">*</span>
            </div>
            <div className="grow w-full flex flex-col gap-1">
              <UploadInput id="cv" name="cv" onFileSelect={handleFileSelect} />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 md:gap-7 items-start mt-14 text-white" data-koreanable>
            <div className="rounded-none w-full md:w-56 text-base md:text-xl flex-none">
              {t['career.form.comment']}
            </div>
            <div className="grow w-full flex flex-col gap-1">
              <textarea name="comment" id="comment" className="bg-[#282828] border border-black text-lg p-3" rows={4}></textarea>
              <label className="flex items-center text-[10px] text-[#7d7d7d] font-extralight gap-2">
                <input type="checkbox" className="text-transparent size-3" /> {t['career.form.agreement']}
              </label>
            </div>
          </div>

          <div className="flex items-center justify-center mt-14 text-white">
            <button type="submit" className={`border-2 hover:bg-white hover:text-[#1b1b1b] border-white uppercase bg-transparent px-3 py-2 font-medium text-2xl ${montserratIfKo(t['career.form.submit'], locale)}`}>{t['career.form.submit']}</button>
          </div>
        </Form>
      </Container>
      {/* Footer removed per request */}
    </section >
  </div>
}