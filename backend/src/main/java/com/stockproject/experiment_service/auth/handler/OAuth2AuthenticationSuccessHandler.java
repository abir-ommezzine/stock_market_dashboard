package com.stockproject.experiment_service.auth.handler;

import com.stockproject.experiment_service.auth.model.Role;
import com.stockproject.experiment_service.auth.model.User;
import com.stockproject.experiment_service.auth.repository.UserRepository;
import com.stockproject.experiment_service.auth.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Map;

@Component
@ConditionalOnProperty(
    prefix = "spring.security.oauth2.client.registration.google",
    name = "client-id",
    matchIfMissing = false
)
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public OAuth2AuthenticationSuccessHandler(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        
        String provider = extractProvider(request);
        String email = extractEmail(oAuth2User, provider);
        String providerId = extractProviderId(oAuth2User, provider);
        String firstName = extractFirstName(oAuth2User, provider);
        String lastName = extractLastName(oAuth2User, provider);

        User user = userRepository.findByEmail(email)
                .orElseGet(() -> createNewUser(email, providerId, provider, firstName, lastName));

        if (user.getProvider() == null) {
            user.setProvider(provider);
            user.setProviderId(providerId);
            user.setEmailVerified(true);
            userRepository.save(user);
        }

        String token = jwtUtil.generateToken(user.getEmail());

        String redirectUrl = UriComponentsBuilder.fromUriString("http://localhost:5173/auth/oauth2/redirect")
                .queryParam("token", token)
                .queryParam("email", user.getEmail())
                .queryParam("firstName", user.getFirstName())
                .queryParam("lastName", user.getLastName())
                .queryParam("role", user.getRole().name())
                .queryParam("id", user.getId())
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }

    private User createNewUser(String email, String providerId, String provider, String firstName, String lastName) {
        User newUser = User.builder()
                .email(email)
                .password("")
                .firstName(firstName)
                .lastName(lastName)
                .provider(provider)
                .providerId(providerId)
                .role(Role.USER)
                .emailVerified(true)
                .build();
        return userRepository.save(newUser);
    }

    private String extractProvider(HttpServletRequest request) {
        String uri = request.getRequestURI();
        if (uri.contains("google")) return "google";
        if (uri.contains("github")) return "github";
        return "unknown";
    }

    private String extractEmail(OAuth2User oAuth2User, String provider) {
        if ("google".equals(provider)) {
            return oAuth2User.getAttribute("email");
        } else if ("github".equals(provider)) {
            String email = oAuth2User.getAttribute("email");
            if (email == null || email.isEmpty()) {
                Map<String, Object> attributes = oAuth2User.getAttributes();
                email = (String) attributes.get("login") + "@github.user";
            }
            return email;
        }
        return oAuth2User.getAttribute("email");
    }

    private String extractProviderId(OAuth2User oAuth2User, String provider) {
        if ("google".equals(provider)) {
            return oAuth2User.getAttribute("sub");
        } else if ("github".equals(provider)) {
            Object id = oAuth2User.getAttribute("id");
            return id != null ? id.toString() : null;
        }
        return null;
    }

    private String extractFirstName(OAuth2User oAuth2User, String provider) {
        if ("google".equals(provider)) {
            return oAuth2User.getAttribute("given_name");
        } else if ("github".equals(provider)) {
            String name = oAuth2User.getAttribute("name");
            if (name != null && name.contains(" ")) {
                return name.split(" ")[0];
            }
            return name != null ? name : oAuth2User.getAttribute("login");
        }
        return "User";
    }

    private String extractLastName(OAuth2User oAuth2User, String provider) {
        if ("google".equals(provider)) {
            return oAuth2User.getAttribute("family_name");
        } else if ("github".equals(provider)) {
            String name = oAuth2User.getAttribute("name");
            if (name != null && name.contains(" ")) {
                String[] parts = name.split(" ");
                return parts[parts.length - 1];
            }
            return "";
        }
        return "";
    }
}
