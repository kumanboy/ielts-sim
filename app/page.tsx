import Banner from "../components/Banner";
import ListeningSection from "@/components/ListeningSection";
import ReadingSection from "@/components/ReadingSection";
import WritingSection from "@/components/WritingSection";
import SpeakingSection from "@/components/SpeakingSection";
import InstagramBanner from "@/components/InstagramBanner";

export default function HomePage() {
    return (
        <>
            <Banner />
            <ListeningSection/>
            <ReadingSection/>
            <InstagramBanner/>
            <WritingSection/>
            <SpeakingSection/>
        </>
    );
}
