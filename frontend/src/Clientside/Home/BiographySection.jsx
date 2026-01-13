import React from "react";
import styled from "styled-components";
import { FaAward, FaUsers, FaCalendarAlt, FaStar } from "react-icons/fa";

const BiographyContainer = styled.section`
  padding: clamp(2rem, 4vw, 5rem) 2rem;
  background: white;

  @media (max-width: 768px) {
    padding: clamp(1.5rem, 3.5vw, 4rem) 1.5rem;
  }

  @media (max-width: 480px) {
    padding: 2rem 1rem;
  }
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(1.5rem, 3vw, 4rem);
  align-items: center;

  @media (max-width: 1024px) {
    gap: 2.5rem;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2.5rem;
    text-align: center;
  }
`;

const TextContent = styled.div`
  padding-right: 2rem;

  @media (max-width: 768px) {
    padding-right: 0;
  }
`;

const SectionBadge = styled.div`
  background: linear-gradient(135deg, #4f46e5 0%, #7e22ce 100%);
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 50px;
  font-weight: 600;
  font-size: 0.9rem;
  display: inline-block;
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h2`
  font-size: clamp(1.8rem, 3vw, 2.8rem);
  font-weight: 800;
  margin-bottom: 1.5rem;
  color: #1f2937;
  line-height: 1.18;
`;

const SectionSubtitle = styled.h3`
  font-size: clamp(1.1rem, 1.6vw, 1.4rem);
  color: #4f46e5;
  margin-bottom: 1.5rem;
  font-weight: 600;
`;

const Paragraph = styled.p`
  font-size: clamp(0.98rem, 1.2vw, 1.1rem);
  margin-bottom: 1.5rem;
  color: #6b7280;
  line-height: 1.7;
`;

const HighlightText = styled.p`
  font-weight: 700;
  color: #4f46e5;
  font-size: 1.2rem;
  margin: 2rem 0;
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 12px;
  border-left: 4px solid #4f46e5;

  @media (max-width: 480px) {
    font-size: 1.1rem;
    margin: 1.5rem 0;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin: 2rem 0;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const StatItem = styled.div`
  text-align: center;
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 12px;
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: 800;
  color: #4f46e5;
  margin-bottom: 0.5rem;

  @media (max-width: 480px) {
    font-size: 1.8rem;
  }
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 600;
`;

const ImageContent = styled.div`
  background: linear-gradient(135deg, #4f46e5 0%, #7e22ce 100%);
  border-radius: 24px;
  padding: 3rem;
  color: white;
  text-align: center;
  box-shadow: 0 20px 40px rgba(79, 70, 229, 0.3);
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 2.5rem;
  }

  @media (max-width: 480px) {
    padding: 2rem 1.5rem;
  }
`;

const YearBadge = styled.div`
  background: #ffd93d;
  color: #1f2937;
  padding: 0.8rem 2rem;
  border-radius: 50px;
  font-weight: 800;
  font-size: 1.1rem;
  display: inline-block;
  margin-bottom: 1.5rem;
  box-shadow: 0 8px 20px rgba(255, 217, 61, 0.3);
`;

const ImageTitle = styled.h3`
  font-size: 1.8rem;
  font-weight: 800;
  margin-bottom: 1rem;

  @media (max-width: 480px) {
    font-size: 1.5rem;
  }
`;

const ImageDescription = styled.p`
  line-height: 1.7;
  opacity: 0.9;
  margin-bottom: 2rem;
`;

const FeaturesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
`;

const FeatureIcon = styled.div`
  font-size: 1.2rem;
  color: #ffd93d;
`;

const FeatureText = styled.div`
  text-align: left;
  font-weight: 600;
`;

const BiographySection = () => {
  return (
    <BiographyContainer id="about">
      <ContentWrapper>
        <TextContent>
          <SectionBadge>About ZeeCare</SectionBadge>
          <SectionTitle>Who We Are</SectionTitle>
          <SectionSubtitle>
            Your Trusted Healthcare Partner Since 2004
          </SectionSubtitle>

          <Paragraph>
            Lorem ipsum dolor sit amet consectetur adipiscing elit. Pleased
            cullip voluptate egestad i lacinia ex, totum aliquet error?
          </Paragraph>

          <HighlightText>We are all in 2004</HighlightText>

          <Paragraph>
            Lorem ipsum dolor sit amet consectetur adipiscing elit. Pleased
            cullip voluptate egestad i lacinia ex, totum aliquet error?
          </Paragraph>

          <StatsGrid>
            <StatItem>
              <StatNumber>50K+</StatNumber>
              <StatLabel>Happy Patients</StatLabel>
            </StatItem>
            <StatItem>
              <StatNumber>200+</StatNumber>
              <StatLabel>Expert Doctors</StatLabel>
            </StatItem>
            <StatItem>
              <StatNumber>20+</StatNumber>
              <StatLabel>Years Experience</StatLabel>
            </StatItem>
            <StatItem>
              <StatNumber>24/7</StatNumber>
              <StatLabel>Emergency Care</StatLabel>
            </StatItem>
          </StatsGrid>
        </TextContent>

        <ImageContent>
          <YearBadge>Since 2004</YearBadge>
          <ImageTitle>20+ Years of Excellence</ImageTitle>
          <ImageDescription>
            Two decades of dedicated service in healthcare, continuously
            evolving to provide the best medical care to our community with
            compassion and expertise.
          </ImageDescription>

          <FeaturesList>
            <FeatureItem>
              <FeatureIcon>
                <FaAward />
              </FeatureIcon>
              <FeatureText>Certified Medical Excellence</FeatureText>
            </FeatureItem>
            <FeatureItem>
              <FeatureIcon>
                <FaUsers />
              </FeatureIcon>
              <FeatureText>Patient-Centered Care</FeatureText>
            </FeatureItem>
            <FeatureItem>
              <FeatureIcon>
                <FaCalendarAlt />
              </FeatureIcon>
              <FeatureText>24/7 Available Services</FeatureText>
            </FeatureItem>
            <FeatureItem>
              <FeatureIcon>
                <FaStar />
              </FeatureIcon>
              <FeatureText>5-Star Rated Facility</FeatureText>
            </FeatureItem>
          </FeaturesList>
        </ImageContent>
      </ContentWrapper>
    </BiographyContainer>
  );
};

export default BiographySection;
