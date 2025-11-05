import { useOutletContext } from "@remix-run/react";
import { forwardRef } from "react";
import { Container } from "~/components/ui/container";
import { AppContext } from "~/root";

const teams = [
  {
    "name": "Architech",
    "members": [
      {
        "avatar_url": "/images/JIMMY CHUNG.png",
        "name": "Jimmy Chung"
      },
      {
        "avatar_url": "/images/TATE TRAN.png",
        "name": "Tate Tran"
      },
      {
        "avatar_url": "/images/HANNA VU.png",
        "name": "Hanna Vu"
      }
    ]
  },
  {
    "name": "Archviz",
    "members": [
      {
        "avatar_url": "/images/TATE TRAN.png",
        "name": "Tate Tran"
      },
      {
        "avatar_url": "/images/PAUL PHAM.png",
        "name": "Paul Pham"
      },
      {
        "avatar_url": "/images/HANNA VU.png",
        "name": "Hanna Vu"
      },
      {
        "avatar_url": "/images/TUNA NGUYEN.png",
        "name": "Tuna Nguyen"
      }
    ]
  },
  {
    "name": "Director",
    "members": [
      {
        "avatar_url": "/images/PAUL PHAM.png",
        "name": "Paul Pham"
      },
    ]
  },
  {
    "name": "Editor",
    "members": [
      {
        "avatar_url": "/images/TOM TRAN.png",
        "name": "Tom Tran"
      },
    ]
  },
  {
    "name": "Marketor",
    "members": [
      {
        "avatar_url": "/images/EMMY NGUYEN.png",
        "name": "Emmy Nguyen"
      },
      {
        "avatar_url": "/images/HANNA VU.png",
        "name": "Hanna Vu"
      },
    ]
  }
]

const TeamSection = forwardRef<HTMLElement>((props, ref) => {
  const { translations } = useOutletContext<AppContext>();

  return (
    <section
      ref={ref}
      className="h-full bg-[#1b1b1b] overflow-auto"
      {...props}
    >
      <Container className="flex flex-col lg:flex-row items-start h-auto text-white relative lg:gap-14 xl:gap-20 2xl:gap-36 !py-0">
        <div className="lg:w-[28rem] h-dvh flex items-center lg:sticky lg:top-0 flex-none">
          <div className="">
            <h2 className="font-medium text-xl mb-7">{translations['about.team.title']}</h2>
            {translations["about.team.description"].split('\n').map((row, index) => <p key={index} className="font-light text-[15px] leading-loose mb-7 last:mb-0">{row}</p>)}
          </div>
        </div>
        <div className="py-14 flex flex-col gap-3">
          {teams.map((team, index) => <div key={index}>
            <h3 className="font-bold text-xl mb-1">{team.name}</h3>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-1">
              {team.members.map((member, index) => <div key={index} className="aspect-square">
                <img src={member.avatar_url} alt={member.name} className="object-cover" />
              </div>)}
            </div>
          </div>)}
        </div>
      </Container>
    </section>
  );
});

TeamSection.displayName = "TeamSection";

export { TeamSection };
