import { useOutletContext } from "@remix-run/react"
import { AppContext } from "~/root"
import { Container } from "~/components/ui/container"
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react"
import { useInView } from "motion/react"
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area"
import { cn } from "~/lib/utils"
import * as Tooltip from "@radix-ui/react-tooltip";

const ProcessSection = forwardRef<HTMLElement>((props, forwardedRef) => {
  const ref = useRef<HTMLElement>(null);
  const { translations: t } = useOutletContext<AppContext>();
  const inView = useInView(ref, { amount: 1 })
  
  const processes = [
    { name: t['Consultation'], description: t["We discuss the client's requirements, project objectives, and scope. The optimal solution is proposed based on the project style, timeline, and budget. A final quotation is sent, and mutual agreement is reached before proceeding."]},
    { name: t['Contract Signing'], description: t["Once the scope and pricing are agreed upon, a formal contract is signed. An initial deposit is made to confirm the project. The production schedule and key milestones are finalized and shared."]},
    { name: t['Project Kickoff'], description: t["We collect and analyze essential materials (blueprints, reference images, etc.). The initial project brief is created and distributed to the CG and editing teams. Basic modeling, scene setup, and primary composition begin."]},
    { name: t['Interim Review'], description: t["The first draft is produced and shared with the client (key scenes, camera movement, color scheme, etc.). Client feedback is incorporated, and secondary revisions are implemented. Lighting, textures, and detailed refinements enhance the realism and quality of the video."]},
    { name: t['Final Adjustments'], description: t["The second draft is delivered for the final round of client feedback. Sound design, color correction, and final edits are applied. Once the client approves the final version, encoding and file formatting are completed."]},
    { name: t['Delivery & Final Payment'], description: t["The client makes the final payment after reviewing the completed work. All files are organized and delivered in the requested format (Full HD / 4K, etc.). Post-delivery support and additional client requests are reviewed."]},
  ]

  useImperativeHandle(forwardedRef, () => ref.current as HTMLElement);

  useEffect(() => {
    const headerDom = document.getElementById("header");

    if (!headerDom || !inView) return;

    headerDom.dataset.variant = "light";
  }, [inView]);

  return <section ref={ref} className="h-dvh overflow-auto flex py-14 lg:py-20 overscroll-none" data-koreanable {...props}>
    <Tooltip.Provider>
      <Container className="flex-none m-auto flex h-full flex-col lg:!px-20 !py-0" variant="fluid">
        <div className="text-center my-7">
          <h3 className="font-semibold text-3xl sm:text-4xl md:text-5xl uppercase text-white mb-2 md:mb-3">{t['component.process.title']}</h3>
        </div>
        <div>
          <p className="font-bold text-xl mb-5 text-white">{t['Image rendering']}</p>
          <p className="text-base font-extralight leading-loose text-white">{t['Contract – Work Commencement – Interim Review – Revisions – Final Inspection']}</p>
        </div>
        <div className="mt-14">
          <p className="font-bold text-xl mb-5 text-white">{t['Work process']}</p>
        </div>
        <div className="h-full -mx-5 sm:mx-0">
          <ScrollArea className="w-full h-[34rem] lg:h-full" type="auto">
            <div className="flex flex-nowrap items-center min-h-full h-full">
              {processes.map((item, index) =>
                <ProcessItem key={index} item={item} index={index} itemCount={processes.length} />
              )}
            </div>
            <ScrollBar orientation="horizontal" className="w-40 mb-14 lg:mb-0 h-2 p-0 bg-[#121212]" />
          </ScrollArea>
        </div>
      </Container>
    </Tooltip.Provider>
  </section>
});

ProcessSection.displayName = "ProcessSection";

function ProcessItem({ item, index, itemCount }: { item: { name: string, description: string }, index: number, itemCount: number }) {
  const [open, setOpen] = useState(false)
  
  return (
    <div key={index} className="min-w-80 flex justify-center w-full relative z-50 group">
      <div className={cn('h-px bg-white absolute top-2', index === 0 ? 'w-1/2 right-0' : (index === itemCount - 1 ? 'left-0 w-1/2' : 'w-full'))}></div>
      <Tooltip.Root delayDuration={0} open={open} onOpenChange={setOpen}>
        <Tooltip.Trigger asChild>
          <div className="size-4 bg-white relative group" role="presentation" onClick={() => setOpen(true)}>
            <div className={cn('w-4 bg-white hidden group-has-[div[data-side=top]]:aspect-[1/cos(51deg)] group-has-[div[data-side=top]]:-top-2.5 group-data-[state=delayed-open]:block group-data-[state=instant-open]:block group-has-[div[data-side=bottom]]:-bottom-3 group-has-[div[data-side=bottom]]:mb-px group-has-[div[data-side=bottom]]:rotate-180 group-has-[div[data-side=bottom]]:aspect-[1/cos(47deg)]')} style={{
              position: 'absolute',
              clipPath: "polygon(50% 0,100% 100%,0 100%)"
            }}></div>
          </div>
        </Tooltip.Trigger>
        <Tooltip.Content side={index % 2 === 0 ? 'top' : 'bottom'} sideOffset={18} className="shadow-none rounded-none bg-[#1b1b1b] border-2 text-white border-white w-96 min-w-96 max-w-full p-3 !z-50 TooltipContent">
          <p className="text-base md:text-xl font-medium mb-2">{item.name}</p>
          <p className="text-sm lg:text-base font-extralight">{item.description}</p>
          <Tooltip.Arrow className="-my-0.5 border-none fill-[#1b1b1b] drop-shadow-[0_3px_0_white] w-5 h-3" />
        </Tooltip.Content>
      </Tooltip.Root>
      <div className={cn("absolute group-has-[div[data-state=delayed-open]]:hidden group-has-[div[data-state=instant-open]]:hidden text-white", index % 2 === 0 ? "-top-8" : "-bottom-8")}>
        {item.name}
      </div>
    </div>
  );
}

export { ProcessSection };