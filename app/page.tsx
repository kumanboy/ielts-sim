import Banner from "../components/Banner";
import ListeningSection from "@/components/ListeningSection";
import ReadingSection from "@/components/ReadingSection";
import WritingSection from "@/components/WritingSection";

export default function HomePage() {
    return (
        <>
            <Banner />
            <ListeningSection/>
            <ReadingSection/>
            <WritingSection/>
        </>
    );
}
