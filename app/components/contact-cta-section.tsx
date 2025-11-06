import { Link, useOutletContext } from "@remix-run/react";
import { localePath, montserratIfKo } from "~/lib/utils";
import { AppContext } from "~/root";

export function ContactCtaSection(props: {
  externalTranslations?: AppContext["translations"];
  externalLocale?: string;
}) {
  const { translations: t, locale } = useOutletContext<AppContext>() ?? {
    translations: props.externalTranslations,
    locale: props.externalLocale,
  };
  const column2Body = t?.["component.contact.column_2.body"] as string | undefined;

  return (
    <div className="flex flex-col lg:flex-row lg:items-stretch text-white gap-14">
      <div className="grow lg:w-1/2">
        <p className="font-semibold text-base sm:text-2xl mb-2" data-koreanable>
          {t["component.contact.column_1.title"]}
        </p>
        <div className="font-extralight text-sm sm:text-base leading-7">
          <p data-koreanable>{t["component.contact.column_1.body"]}</p>
          <p className="mt-2">
            <span data-koreanable className={montserratIfKo(t["HR manager"] as string, locale)}>{t["HR manager"]}</span>: <span className={montserratIfKo("jobs@visualennode.com", locale)}>jobs@visualennode.com</span>
          </p>
          <div className="mt-2 flex items-center gap-5">
            <p>
              <span data-koreanable className={montserratIfKo(t["Phone"] as string, locale)}>{t["Phone"]}</span>: <span className={montserratIfKo("02-515-7400", locale)}>02-515-7400</span>
            </p>

            <div className="flex items-center gap-2 ml-auto">
              <Link
                to="https://instagram.com/visual_ennode"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="/images/instagram.svg"
                  loading="lazy"
                  className="size-5"
                  alt="Instagram"
                />
              </Link>
              <Link
                to="https://www.youtube.com/@visualennode"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="/images/youtube-square.svg"
                  loading="lazy"
                  className="size-5"
                  alt="YouTube"
                />
              </Link>
              <Link
                to="https://pf.kakao.com/_ggesn/chat"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="/images/talk.svg"
                  loading="lazy"
                  className="size-5"
                  alt="Talk"
                />
              </Link>
              <Link
                to="https://www.facebook.com/profile.php?id=61573221556208"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="/images/fb.svg"
                  loading="lazy"
                  className="size-5"
                  alt="Facebook"
                />
              </Link>
              <Link
                to="https://blog.naver.com/visualennode"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="/images/blog.svg"
                  loading="lazy"
                  className="size-5"
                  alt="Blog"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="grow lg:w-1/2 flex flex-col">
        <p className="font-semibold text-base sm:text-2xl mb-2" data-koreanable>
          {t["component.contact.column_2.title"]}
        </p>
        <div className="font-extralight text-sm sm:text-base leading-7 h-full flex flex-col">
          {(column2Body ?? "").split(/\r?\n/).map((line, i) => (
            <p key={i} data-koreanable className={i === 0 ? undefined : "mt-2"}>
              {line}
            </p>
          ))}
          <p className="mt-auto">
            <span data-koreanable>{t["component.contact.column_2.cta"]}</span>:{" "}
            <Link
              to={localePath(locale, "career")}
              className={`font-semibold ${montserratIfKo(t["Career"] as string, locale)}`}
              prefetch="intent"
            >
              {t["Career"]}
            </Link>
          </p>
        </div>
      </div>
      <div className="hidden lg:block w-96">
        <p className="font-semibold text-base sm:text-2xl mb-2" data-koreanable>
          {t["component.contact.column_3.title"]}
        </p>
        <div className="font-extralight text-sm sm:text-base leading-7">
          <div className="grid grid-cols-2 w-56 space-y-1">
            <div>
              <Link to={localePath(locale, "")} className={`link-animation ${montserratIfKo(t["Home"] as string, locale)}`}>
                {t["Home"]}
              </Link>
            </div>
            <div>
              <Link
                to={localePath(locale, "career")}
                className={`link-animation ${montserratIfKo(t["Career"] as string, locale)}`}
              >
                {t["Career"]}
              </Link>
            </div>
            <div>
              <Link to={localePath(locale, "works")} className={`link-animation ${montserratIfKo(t["Works"] as string, locale)}`}>
                {t["Works"]}
              </Link>
            </div>
            <div>
              <Link
                to={localePath(locale, "contact")}
                className={`link-animation ${montserratIfKo(t["Contact us"] as string, locale)}`}
              >
                {t["Contact us"]}
              </Link>
            </div>
            <div>
              <Link to={localePath(locale, "about")} className={`link-animation ${montserratIfKo(t["About us"] as string, locale)}`}>
                {t["About us"]}
              </Link>
            </div>
            <div>
              <Link
                to={localePath(locale, "privacy")}
                className={`link-animation ${montserratIfKo(t["Privacy policy"] as string, locale)}`}
              >
                {t["Privacy policy"]}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
