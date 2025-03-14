import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled components với Tailwind CSS
const FooterContainer = styled(Box)(({ theme }) => ({
  backgroundColor: '#1E3A8A', // Màu xanh đậm giống trong ảnh
  color: '#fff',
  padding: theme.spacing(2),
  textAlign: 'center',
  position: 'relative',
  overflow: 'hidden',
}));

const LinksSection = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  gap: '20px',
  marginBottom: '10px',
  flexWrap: 'wrap',
});

const HotlineSection = styled(Box)({
  marginBottom: '10px',
});

const CopyrightSection = styled(Box)({
  fontSize: '12px',
  marginBottom: '10px',
});

const Footer: React.FC = () => {
  return (
    <FooterContainer>
      {/* Links Section */}
      <LinksSection>
        <Typography variant="body2">Accommodations</Typography>
        <Typography variant="body2">Shopping</Typography>
        <Typography variant="body2">Plan</Typography>
        <Typography variant="body2">Food</Typography>
        <Typography variant="body2">Attractions</Typography>
      </LinksSection>

      {/* Experience on Mobile Apps */}
      <Typography variant="body2" sx={{ marginBottom: '10px' }}>
        EXPERIENCE ON MOBILE APPS
      </Typography>

      {/* Hotline */}
      <HotlineSection>
        <Typography variant="body2">Hotline: 02633822342</Typography>
      </HotlineSection>

      {/* Developed by */}
      <Typography variant="body2" sx={{ marginBottom: '10px' }}>
        Developed by Vietnam Posts and Telecommunications Group
      </Typography>

      {/* Copyright */}
      <CopyrightSection>
        <Typography variant="caption">
          Lượt truy cập: 4 1 2 7 8 4 6 4
        </Typography>
      </CopyrightSection>

      {/* Background Decoration */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url('/dandelion-bg.png')`, // Thay bằng đường dẫn thực tế của hình nền cỏ dại
          backgroundRepeat: 'repeat-x',
          backgroundPosition: 'bottom',
          opacity: 0.1,
          zIndex: 0,
        }}
      />
    </FooterContainer>
  );
};

export default Footer;